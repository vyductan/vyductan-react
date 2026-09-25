import { describe, expect, it } from "vitest";

import { encodeWav, pcm16Wav, WAV_SAMPLE_RATE } from "./encode-wav";

/** A second of 440 Hz at the given rate — a stand-in for a real take. */
function tone(sampleRate: number, seconds = 1): Float32Array {
  const samples = new Float32Array(sampleRate * seconds);
  for (let index = 0; index < samples.length; index++) {
    samples[index] = 0.5 * Math.sin((2 * Math.PI * 440 * index) / sampleRate);
  }
  return samples;
}

async function header(blob: Blob) {
  const view = new DataView(await blob.arrayBuffer());
  const ascii = (offset: number) =>
    String.fromCodePoint(
      ...[0, 1, 2, 3].map((index) => view.getUint8(offset + index)),
    );
  return {
    riff: ascii(0),
    wave: ascii(8),
    format: view.getUint16(20, true),
    channels: view.getUint16(22, true),
    sampleRate: view.getUint32(24, true),
    bits: view.getUint16(34, true),
    dataSize: view.getUint32(40, true),
    totalSize: blob.size,
  };
}

describe("encodeWav", () => {
  // Real decoding and resampling: this is why the file runs in chromium.
  it("resamples a 44.1 kHz take to 16 kHz mono PCM", async () => {
    const source = pcm16Wav(tone(44_100), 44_100);
    const wav = await encodeWav(source);
    const info = await header(wav);

    expect(wav.type).toBe("audio/wav");
    expect(info).toMatchObject({
      riff: "RIFF",
      wave: "WAVE",
      format: 1,
      channels: 1,
      sampleRate: WAV_SAMPLE_RATE,
      bits: 16,
    });
    // One second in, one second out — not 44 100 samples relabelled.
    expect(info.dataSize / 2).toBeCloseTo(WAV_SAMPLE_RATE, -2);
    expect(info.totalSize).toBe(44 + info.dataSize);
  });

  it("keeps the signal, not silence", async () => {
    const wav = await encodeWav(pcm16Wav(tone(48_000), 48_000));
    const samples = new Int16Array((await wav.arrayBuffer()).slice(44));
    const peak = samples.reduce((max, s) => Math.max(max, Math.abs(s)), 0);
    // 0.5 amplitude ≈ 16 383; resampling may shave a little.
    expect(peak).toBeGreaterThan(12_000);
  });
});

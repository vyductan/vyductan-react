/**
 * Re-encode a recording as 16 kHz mono 16-bit PCM WAV.
 *
 * Browsers record in whatever they like — Chromium `audio/webm;codecs=opus`,
 * Safari `audio/mp4` — and neither is a format every speech model accepts
 * (OpenRouter's `input_audio`, for one, takes wav and mp3 but not webm).
 * Converting here means one format leaves the browser and the server needs no
 * ffmpeg. 16 kHz mono is what speech models are trained on; more is bytes
 * without information: ~32 KB per second, so a minute is under 2 MB.
 */
export const WAV_SAMPLE_RATE = 16_000;

export async function encodeWav(recording: Blob): Promise<Blob> {
  const encoded = await recording.arrayBuffer();

  // Decoding needs a context but not its rate; the offline pass resamples.
  const decoder = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await decoder.decodeAudioData(encoded);
  } finally {
    void decoder.close();
  }

  const length = Math.max(1, Math.ceil(decoded.duration * WAV_SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, length, WAV_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  // Connecting a stereo buffer to a mono destination down-mixes it.
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();

  return pcm16Wav(rendered.getChannelData(0), WAV_SAMPLE_RATE);
}

/** A canonical 44-byte RIFF header followed by little-endian 16-bit samples. */
export function pcm16Wav(samples: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index++) {
      view.setUint8(offset + index, text.codePointAt(index) ?? 0);
    }
  };

  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); // byte rate
  view.setUint16(32, bytesPerSample, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(36, "data");
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < samples.length; index++) {
    // Clamp before scaling: resampling can overshoot ±1 slightly.
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
    view.setInt16(
      44 + index * bytesPerSample,
      sample < 0 ? sample * 0x80_00 : sample * 0x7f_ff,
      true,
    );
  }

  return new Blob([buffer], { type: "audio/wav" });
}

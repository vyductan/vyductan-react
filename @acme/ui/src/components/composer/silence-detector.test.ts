import { describe, expect, it } from "vitest";

import type { SilenceDetectorOptions } from "./silence-detector";
import { createSilenceDetector } from "./silence-detector";

/** Feed one reading every 100 ms; return the first decision that is not "listening". */
function run(
  levels: number[],
  options: SilenceDetectorOptions = { silenceMs: 800 },
) {
  const detector = createSilenceDetector(options);
  for (const [index, rms] of levels.entries()) {
    const decision = detector.push(rms, index * 100);
    if (decision !== "listening") return { decision, atMs: index * 100 };
  }
  return { decision: "listening" as const, atMs: null };
}

const quiet = (n: number, level = 0.005) =>
  Array.from({ length: n }, () => level);
const speech = (n: number, level = 0.1) =>
  Array.from({ length: n }, () => level);

describe("createSilenceDetector", () => {
  it("ends the turn after speech followed by enough quiet", () => {
    // 300 ms room, 1 s of speech, then silence.
    const result = run([...quiet(3), ...speech(10), ...quiet(20)]);
    expect(result.decision).toBe("stop");
    // Quiet starts at 1300 ms; 800 ms of it ends the turn.
    expect(result.atMs).toBe(2100);
  });

  it("does not end the turn on a pause shorter than the silence window", () => {
    const result = run([...quiet(3), ...speech(5), ...quiet(5), ...speech(5)]);
    expect(result.decision).toBe("listening");
  });

  it("gives up when nothing is said", () => {
    const result = run(quiet(100), {
      silenceMs: 800,
      noSpeechMs: 5000,
    });
    expect(result.decision).toBe("no-speech");
    expect(result.atMs).toBe(5000);
  });

  // A noisy café floor must not count as speech.
  it("measures the room instead of using a fixed level", () => {
    const noisyRoom = quiet(3, 0.04);
    const result = run([...noisyRoom, ...quiet(100, 0.05)], {
      silenceMs: 800,
      noSpeechMs: 3000,
    });
    expect(result.decision).toBe("no-speech");
  });

  it("ignores a single loud frame such as a click", () => {
    const result = run([...quiet(3), 0.3, ...quiet(100)], {
      silenceMs: 800,
      noSpeechMs: 4000,
    });
    expect(result.decision).toBe("no-speech");
  });

  // Hands-free reopens the mic the moment the partner stops, and people answer
  // at once: speech inside the calibration window must not become the floor.
  it("hears a speaker who starts talking before the room is measured", () => {
    const result = run([...speech(12), ...quiet(20)]);
    expect(result.decision).toBe("stop");
  });
});

/**
 * Decides when a spoken turn is over, from the microphone's loudness over time.
 *
 * Pure on purpose — levels in, a decision out — so it is tested with numbers
 * rather than with a microphone. The recorder feeds it one RMS reading per
 * frame (see useAudioRecorder's `autoStop`).
 *
 * The threshold is relative to the room, not fixed: the first readings are
 * taken as the noise floor, and speech is anything clearly above it. A fixed
 * level either fires on a noisy café or never on a quiet laptop mic.
 */
export type SilenceDetectorOptions = {
  /** Readings used to measure the room before listening. */
  calibrationMs?: number;
  /** Quiet after speech that ends the turn. */
  silenceMs: number;
  /** Give up if nothing is said at all for this long. */
  noSpeechMs?: number;
  /** Speech must be this many times the noise floor. */
  ratio?: number;
  /** …and at least this loud, so a silent room does not set a zero bar. */
  minThreshold?: number;
  /**
   * …and at most this loud. Normal speech reads ~0.05–0.2 RMS, so a floor
   * measured while someone was already talking cannot push the bar past it —
   * yet high enough that a loud café (~0.04–0.05) is still not speech.
   */
  maxThreshold?: number;
};

export type SilenceDecision = "listening" | "stop" | "no-speech";

export function createSilenceDetector({
  calibrationMs = 300,
  silenceMs,
  noSpeechMs = 8000,
  ratio = 2.5,
  minThreshold = 0.015,
  maxThreshold = 0.06,
}: SilenceDetectorOptions) {
  let startedAt: number | null = null;
  const calibration: number[] = [];
  let threshold: number | null = null;
  let heardSpeech = false;
  let loudFrames = 0;
  let quietSince: number | null = null;

  return {
    /** Whether the learner has started speaking in this take. */
    get heardSpeech() {
      return heardSpeech;
    },

    push(rms: number, now: number): SilenceDecision {
      startedAt ??= now;
      const elapsed = now - startedAt;

      if (threshold === null) {
        if (elapsed < calibrationMs) {
          calibration.push(rms);
          return "listening";
        }
        const floor =
          calibration.length > 0
            ? calibration.reduce((sum, value) => sum + value, 0) /
              calibration.length
            : 0;
        threshold = Math.min(
          maxThreshold,
          Math.max(minThreshold, floor * ratio),
        );
        // People answer the moment the mic opens. Speech during calibration
        // still counts once the bar is known, instead of being thrown away as
        // "room noise".
        const loudDuringCalibration = calibration.filter(
          (value) => value >= (threshold ?? Infinity),
        ).length;
        if (loudDuringCalibration >= 2) heardSpeech = true;
      }

      if (rms >= threshold) {
        // Two frames in a row: one click or bump is not the learner speaking.
        loudFrames += 1;
        if (loudFrames >= 2) heardSpeech = true;
        quietSince = null;
        return "listening";
      }

      loudFrames = 0;
      if (!heardSpeech) {
        return elapsed >= noSpeechMs ? "no-speech" : "listening";
      }

      // Below a slightly lower bar counts as quiet, so a voice trailing off at
      // the threshold does not flicker between speaking and silent.
      if (rms < threshold * 0.8) {
        quietSince ??= now;
        if (now - quietSince >= silenceMs) return "stop";
      }
      return "listening";
    },
  };
}

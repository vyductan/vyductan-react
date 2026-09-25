import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { SilenceDetectorOptions } from "./silence-detector";
import { encodeWav } from "./encode-wav";
import { createSilenceDetector } from "./silence-detector";

// Support is a browser fact: false on the server and through hydration.
const noSubscribe = () => () => undefined;
const getSupported = () =>
  typeof MediaRecorder !== "undefined" &&
  typeof navigator.mediaDevices?.getUserMedia === "function";
const getServerSupported = () => false;

export type AudioRecorderErrorCode =
  /** Microphone permission refused, or blocked by the page's policy. */
  | "not-allowed"
  /** No microphone, or it could not be opened. */
  | "audio-capture"
  /** The recording could not be decoded or re-encoded. */
  | "encode-failed";

export type UseAudioRecorderOptions = {
  /** A finished take, as a 16 kHz mono WAV `File`. */
  onRecorded: (file: File) => void;
  onError?: (code: AudioRecorderErrorCode) => void;
  /** Hard stop, so a forgotten mic cannot fill the upload limit. */
  maxDurationMs?: number;
  /**
   * End the take by itself once the speaker goes quiet — hands-free turns.
   * Measures the room first, then stops after `silenceMs` of quiet following
   * speech; with no speech at all for `noSpeechMs` the take is discarded and
   * `onNoSpeech` fires.
   */
  autoStop?: Pick<SilenceDetectorOptions, "silenceMs" | "noSpeechMs">;
  onNoSpeech?: () => void;
};

/**
 * Record a voice message to attach, as opposed to dictation, which types what
 * is said. The take is re-encoded to WAV before it is handed out — see
 * `encodeWav` for why the browser's own format is not good enough.
 */
export function useAudioRecorder({
  onRecorded,
  onError,
  maxDurationMs = 60_000,
  autoStop,
  onNoSpeech,
}: UseAudioRecorderOptions) {
  const supported = useSyncExternalStore(
    noSubscribe,
    getSupported,
    getServerSupported,
  );
  const [recording, setRecording] = useState(false);
  const [encoding, setEncoding] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  /** Microphone loudness, 0–1, for a live meter. Updated ~10× a second. */
  const [level, setLevel] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const discardRef = useRef(false);

  const callbacksRef = useRef({ onRecorded, onError, onNoSpeech });
  useEffect(() => {
    callbacksRef.current = { onRecorded, onError, onNoSpeech };
  }, [onRecorded, onError, onNoSpeech]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }, []);

  /** Stop and throw the take away. */
  const cancel = useCallback(() => {
    discardRef.current = true;
    stop();
  }, [stop]);

  const start = useCallback(async () => {
    if (recorderRef.current) return;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      callbacksRef.current.onError?.(
        name === "NotAllowedError" || name === "SecurityError"
          ? "not-allowed"
          : "audio-capture",
      );
      return;
    }

    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    const startedAt = Date.now();
    discardRef.current = false;

    // Loudness, read off the same stream the recorder takes. The context is
    // only for measuring; it plays nothing.
    const meterContext = new AudioContext();
    const analyser = meterContext.createAnalyser();
    analyser.fftSize = 1024;
    meterContext.createMediaStreamSource(stream).connect(analyser);
    const samples = new Float32Array(analyser.fftSize);
    const detector = autoStop ? createSilenceDetector(autoStop) : null;

    const tick = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startedAt;
      setElapsedMs(elapsed);

      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) sum += sample * sample;
      const rms = Math.sqrt(sum / samples.length);
      // Speech sits around 0.02–0.2 RMS; scaled so a normal voice fills most
      // of a meter.
      setLevel(Math.min(1, rms * 6));

      if (recorder.state !== "recording") return;
      if (elapsed >= maxDurationMs) {
        recorder.stop();
        return;
      }
      const decision = detector?.push(rms, now);
      if (decision === "stop") {
        recorder.stop();
      } else if (decision === "no-speech") {
        discardRef.current = true;
        recorder.stop();
        callbacksRef.current.onNoSpeech?.();
      }
    }, 100);

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    });
    recorder.addEventListener("stop", () => {
      clearInterval(tick);
      void meterContext.close();
      setLevel(0);
      // Release the mic at once, or the browser keeps its indicator lit.
      stream.getTracks().forEach((track) => track.stop());
      recorderRef.current = null;
      setRecording(false);
      setElapsedMs(0);

      if (discardRef.current || chunks.length === 0) return;

      setEncoding(true);
      encodeWav(new Blob(chunks, { type: recorder.mimeType }))
        .then((wav) => {
          const name = `recording-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.wav`;
          callbacksRef.current.onRecorded(
            new File([wav], name, { type: "audio/wav" }),
          );
        })
        .catch(() => callbacksRef.current.onError?.("encode-failed"))
        .finally(() => setEncoding(false));
    });

    recorderRef.current = recorder;
    recorder.start();
    setElapsedMs(0);
    setRecording(true);
    // autoStop is read once per take; a new object each render must not
    // rebuild start() and restart anything.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxDurationMs, autoStop?.silenceMs, autoStop?.noSpeechMs]);

  // Leaving the page mid-take: drop it and free the mic.
  useEffect(
    () => () => {
      discardRef.current = true;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
    },
    [],
  );

  return {
    supported,
    recording,
    encoding,
    elapsedMs,
    level,
    start,
    stop,
    cancel,
  };
}

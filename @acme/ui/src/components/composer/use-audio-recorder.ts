import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { encodeWav } from "./encode-wav";

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
}: UseAudioRecorderOptions) {
  const supported = useSyncExternalStore(
    noSubscribe,
    getSupported,
    getServerSupported,
  );
  const [recording, setRecording] = useState(false);
  const [encoding, setEncoding] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const discardRef = useRef(false);

  const callbacksRef = useRef({ onRecorded, onError });
  useEffect(() => {
    callbacksRef.current = { onRecorded, onError };
  }, [onRecorded, onError]);

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

    const tick = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setElapsedMs(elapsed);
      if (elapsed >= maxDurationMs && recorder.state === "recording") {
        recorder.stop();
      }
    }, 200);

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    });
    recorder.addEventListener("stop", () => {
      clearInterval(tick);
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
  }, [maxDurationMs]);

  // Leaving the page mid-take: drop it and free the mic.
  useEffect(
    () => () => {
      discardRef.current = true;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
    },
    [],
  );

  return { supported, recording, encoding, elapsedMs, start, stop, cancel };
}

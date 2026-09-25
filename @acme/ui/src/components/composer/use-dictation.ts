import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/*
 * The Web Speech API is not in TypeScript's DOM lib, and Chromium and Safari
 * still ship it prefixed. Only the surface the composer uses is typed.
 */
type RecognitionAlternative = { readonly transcript: string };
type RecognitionResult = {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): RecognitionAlternative;
};
type RecognitionResultList = {
  readonly length: number;
  item(index: number): RecognitionResult;
};
type RecognitionEvent = Event & {
  readonly resultIndex: number;
  readonly results: RecognitionResultList;
};
type RecognitionErrorEvent = Event & { readonly error: string };

type Recognition = EventTarget & {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => Recognition;

function getRecognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as typeof window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return (
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition ??
    null
  );
}

// Support is a browser fact the server cannot know: false on the server and
// through hydration, the real answer right after. Read this way, the mic button
// never renders on the server and then vanishes, or the reverse.
const noSubscribe = () => () => undefined;
const getSupported = () => getRecognitionConstructor() !== null;
const getServerSupported = () => false;

export type DictationErrorCode =
  /** Microphone permission refused, or blocked by the page's policy. */
  | "not-allowed"
  /** No microphone, or it could not be opened. */
  | "audio-capture"
  /** The recognition service is unreachable — Chromium sends audio to Google. */
  | "network"
  | (string & {});

export type UseDictationOptions = {
  /** BCP 47 tag, e.g. `en-US`. Defaults to the document's language. */
  lang?: string;
  /** Called once per finished phrase, with its transcript. */
  onFinal: (transcript: string) => void;
  onError?: (code: DictationErrorCode) => void;
};

/**
 * Speech to text for the composer, on the browser's own recognizer.
 *
 * Phrases are handed out only once they are final. Interim text is exposed for
 * display but never written into the editor: recognizers revise a phrase
 * several times before settling, and writing each revision would mean deleting
 * the previous one out of the user's draft — which fights their own typing.
 */
export function useDictation({ lang, onFinal, onError }: UseDictationOptions) {
  const supported = useSyncExternalStore(
    noSubscribe,
    getSupported,
    getServerSupported,
  );
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<Recognition | null>(null);

  // Latest callbacks without restarting a session each render.
  const callbacksRef = useRef({ onFinal, onError });
  useEffect(() => {
    callbacksRef.current = { onFinal, onError };
  }, [onFinal, onError]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Constructor = getRecognitionConstructor();
    if (!Constructor || recognitionRef.current) return;

    const recognition = new Constructor();
    recognition.lang =
      lang ?? (document.documentElement.lang || navigator.language);
    // Continuous, so a pause to think does not end the take; the user stops it.
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let pending = "";
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        const result = event.results.item(index);
        const transcript = result.item(0).transcript;
        if (result.isFinal) {
          const text = transcript.trim();
          if (text) callbacksRef.current.onFinal(text);
        } else {
          pending += transcript;
        }
      }
      setInterim(pending);
    };
    recognition.onerror = (event) => {
      // "aborted" is our own stop(); "no-speech" is silence, not a failure.
      if (event.error === "aborted" || event.error === "no-speech") return;
      callbacksRef.current.onError?.(event.error);
    };
    // Fires for every ending — stop(), an error, or the browser giving up —
    // so it is the one place the state goes back to idle.
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      // start() throws if a session is somehow still live; treat as not started.
      recognitionRef.current = null;
    }
  }, [lang]);

  // A recognizer left running after unmount keeps the mic indicator lit.
  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported, listening, interim, start, stop };
}

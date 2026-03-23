/* eslint-disable react-hooks/set-state-in-effect */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { LexicalCommand, LexicalEditor, RangeSelection } from "lexical";
import { useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { MicIcon } from "lucide-react";

import { Button } from "@acme/ui/components/button";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@acme/ui/components/tooltip";

import { useReport } from "../../editor-hooks/use-report";
import { CAN_USE_DOM } from "../../shared/can-use-dom";

export const SPEECH_TO_TEXT_COMMAND: LexicalCommand<boolean> = createCommand(
  "SPEECH_TO_TEXT_COMMAND",
);

type SpeechRecognitionAlternative = {
  readonly transcript: string;
};

type SpeechRecognitionResult = {
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
};

type SpeechRecognitionResultList = {
  item(index: number): SpeechRecognitionResult;
};

type SpeechRecognitionEvent = Event & {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
};

type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  addEventListener(
    type: "result",
    listener: (event: SpeechRecognitionEvent) => void,
  ): void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognition;

const getSpeechRecognitionConstructor =
  (): SpeechRecognitionConstructor | null => {
    if (!CAN_USE_DOM) {
      return null;
    }

    const speechGlobal = globalThis as typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    return (
      speechGlobal.SpeechRecognition ??
      speechGlobal.webkitSpeechRecognition ??
      null
    );
  };

const SPEECH_RECOGNITION_CONSTRUCTOR = getSpeechRecognitionConstructor();

const VOICE_COMMANDS: Readonly<
  Record<
    string,
    (arg0: { editor: LexicalEditor; selection: RangeSelection }) => void
  >
> = {
  "\n": ({ selection }) => {
    selection.insertParagraph();
  },
  redo: ({ editor }) => {
    editor.dispatchCommand(REDO_COMMAND, void 0);
  },
  undo: ({ editor }) => {
    editor.dispatchCommand(UNDO_COMMAND, void 0);
  },
};

export const SUPPORT_SPEECH_RECOGNITION: boolean =
  SPEECH_RECOGNITION_CONSTRUCTOR !== null;

function SpeechToTextPluginImpl() {
  const [editor] = useLexicalComposerContext();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isSpeechToText, setIsSpeechToText] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  const recognitionConstructor = SPEECH_RECOGNITION_CONSTRUCTOR;
  const recognition = useRef<SpeechRecognition | null>(null);
  const report = useReport();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (recognitionConstructor === null) {
      return;
    }

    if (isEnabled && recognition.current === null) {
      recognition.current = new recognitionConstructor();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.addEventListener(
        "result",
        (event: SpeechRecognitionEvent) => {
          const resultItem = event.results.item(event.resultIndex);
          const { transcript } = resultItem.item(0);
          report(transcript);

          if (!resultItem.isFinal) {
            return;
          }

          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              const command = VOICE_COMMANDS[transcript.toLowerCase().trim()];

              if (command) {
                command({
                  editor,
                  selection,
                });
              } else if (/\s*\n\s*/.test(transcript)) {
                selection.insertParagraph();
              } else {
                selection.insertText(transcript);
              }
            }
          });
        },
      );
    }

    if (recognition.current) {
      if (isEnabled) {
        recognition.current.start();
      } else {
        recognition.current.stop();
      }
    }

    return () => {
      if (recognition.current !== null) {
        recognition.current.stop();
      }
    };
  }, [editor, isEnabled, recognitionConstructor, report]);
  useEffect(() => {
    return editor.registerCommand(
      SPEECH_TO_TEXT_COMMAND,
      (_isEnabled: boolean) => {
        setIsEnabled(_isEnabled);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  // Don't render on server side to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        <Button
          onClick={() => {
            editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
            setIsSpeechToText(!isSpeechToText);
          }}
          variant={isSpeechToText ? "outlined" : "text"}
          title="Speech To Text"
          aria-label={`${isSpeechToText ? "Enable" : "Disable"} speech to text`}
          className="p-2"
          size="small"
        >
          <MicIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Speech To Text</TooltipContent>
    </TooltipRoot>
  );
}

// Use dynamic rendering to avoid hydration issues
export const SpeechToTextPlugin = SUPPORT_SPEECH_RECOGNITION
  ? SpeechToTextPluginImpl
  : () => null;

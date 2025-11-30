/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@acme/ui/components/button";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { RedoIcon, UndoIcon } from "lucide-react";

import { useToolbarContext } from "../../context/toolbar-context";
import { CAN_USE_DOM } from "../../shared/can-use-dom";

const { navigator: maybeNavigator } = globalThis as Partial<typeof globalThis>;

// Use a function to determine IS_APPLE to avoid hydration mismatches
const getIsApple = () => {
  if (!CAN_USE_DOM || !maybeNavigator) {
    return false;
  }
  return (
    typeof maybeNavigator.platform === "string" &&
    /Mac|iPod|iPhone|iPad/.test(maybeNavigator.platform)
  );
};

export function HistoryToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const { activeEditor, $updateToolbar } = useToolbarContext();
  const [isEditable, setIsEditable] = useState(editor.isEditable());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    // Set platform detection after hydration to avoid mismatch
    setIsApple(getIsApple());
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor]);

  return (
    <div className="flex items-center gap-1">
      <Button
        disabled={!canUndo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(UNDO_COMMAND, void 0);
        }}
        title={isApple ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
        type="button"
        aria-label="Undo"
        size="sm"
        className="h-8 w-8"
        variant={"outline"}
      >
        <UndoIcon className="size-4" />
      </Button>
      <Button
        disabled={!canRedo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(REDO_COMMAND, void 0);
        }}
        title={isApple ? "Redo (⇧⌘Z)" : "Redo (Ctrl+Y)"}
        type="button"
        aria-label="Redo"
        size="sm"
        className="h-8 w-8"
        variant={"outline"}
      >
        <RedoIcon className="size-4" />
      </Button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

import { $resolveBlockType } from "../utils/resolve-block-type";

/**
 * Hook to detect the current block type in the Lexical editor
 * @returns The current block type (e.g., "h1", "h2", "paragraph", "bullet", etc.)
 */
export function useBlockType(): string {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState<string>("paragraph");

  useEffect(() => {
    const updateBlockType = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          // If no range selection, default to paragraph
          setBlockType("paragraph");
          return;
        }

        const type = $resolveBlockType(selection, (key) =>
          editor.getElementByKey(key),
        );
        if (type !== null) {
          setBlockType(type);
        }
      });
    };

    // Initial update
    updateBlockType();

    // Listen to selection changes
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateBlockType();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

  return blockType;
}

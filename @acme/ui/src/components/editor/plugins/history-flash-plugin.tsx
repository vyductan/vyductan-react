"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HISTORIC_TAG } from "lexical";

import { changedBlockKeys, flashNodeKeys } from "../utils/flash-block";

// A large undo (a paste, a cleared document) would flash everything at once;
// past this many blocks the highlight stops pointing at anything.
const MAX_FLASHED_BLOCKS = 12;

/**
 * Notion-style highlight on undo and redo: the blocks the step brought back,
 * moved or rewrote flash briefly, so it is visible what just changed.
 */
export function HistoryFlashPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerUpdateListener(
        ({ editorState, prevEditorState, tags }) => {
          if (!tags.has(HISTORIC_TAG)) return;
          const keys = changedBlockKeys(prevEditorState, editorState);
          if (keys.length > 0 && keys.length <= MAX_FLASHED_BLOCKS) {
            flashNodeKeys(editor, keys);
          }
        },
      ),
    [editor],
  );

  return null;
}

"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";

import {
  $selectedBlocks,
  BLOCK_SELECTED_ATTRIBUTE,
} from "../utils/block-selection";

/**
 * Notion-style block selection: once a selection runs from one line into
 * another, every line it spans is highlighted whole, instead of the text
 * inside it. A list line counts as a line of its own at any depth, as in
 * Notion — three items of one list are three blocks. The selection itself is
 * still Lexical's range — copy, delete and typing over it behave as before —
 * and "Turn into", from the block menu or the toolbar, applies to every
 * selected line. Dragging the handle of a block in it moves the top-level
 * blocks it spans (see the draggable block plugin); within a single list,
 * the handle's own line.
 */
export function BlockSelectionPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let marked: HTMLElement[] = [];

    const unmark = () => {
      for (const element of marked) {
        element.removeAttribute(BLOCK_SELECTED_ATTRIBUTE);
      }
      marked = [];
    };

    return mergeRegister(
      unmark,
      editor.registerUpdateListener(({ editorState }) => {
        const keys = editorState.read(() =>
          $selectedBlocks().map((node) => node.getKey()),
        );
        unmark();
        for (const key of keys) {
          const element = editor.getElementByKey(key);
          if (!element) continue;
          element.setAttribute(BLOCK_SELECTED_ATTRIBUTE, "");
          marked.push(element);
        }
      }),
    );
  }, [editor]);

  return null;
}

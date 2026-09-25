"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";

import {
  $selectedTopLevelBlocks,
  BLOCK_SELECTED_ATTRIBUTE,
} from "../utils/block-selection";

/**
 * Notion-style block selection: once a selection runs from one block into
 * another, every block it spans is highlighted whole, instead of the text
 * inside it. The selection itself is still Lexical's range — copy, delete and
 * typing over it behave as before — and dragging the handle of any block in it
 * moves them all (see the draggable block plugin).
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
          $selectedTopLevelBlocks().map((node) => node.getKey()),
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

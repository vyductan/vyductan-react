"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getRoot,
  $isParagraphNode,
} from "lexical";

/**
 * A click below the last block gives a line to type on, as in Notion: the
 * last block if it is an empty line of text already, else a new one after it.
 * Without it a click there put the caret at the end of the last block — after
 * a table, an image or a to-do there was no line to start writing on.
 *
 * Only clicks on the editable itself, below its last block — its own bottom
 * padding, which a page can make as tall as it likes (Notion leaves a third of
 * the screen). Handled on mousedown, with the default prevented, so the
 * browser's caret is never painted at the end of the last block first.
 */
export function ClickBelowPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      // A shift+click extends the selection (ShiftClickSelectPlugin).
      if (event.button !== 0 || event.shiftKey || !editor.isEditable()) return;
      const root = editor.getRootElement();
      if (!root || event.target !== root) return;

      const { clientY } = event;
      editor.update(() => {
        const last = $getRoot().getLastChild();
        const element = last ? editor.getElementByKey(last.getKey()) : null;
        if (element && clientY <= element.getBoundingClientRect().bottom) {
          return;
        }
        event.preventDefault();
        if (
          $isParagraphNode(last) &&
          last.getTextContentSize() === 0 &&
          last.getChildrenSize() === 0
        ) {
          last.selectEnd();
          return;
        }
        const paragraph = $createParagraphNode();
        $getRoot().append(paragraph);
        paragraph.select();
      });
      // preventDefault also stops the browser focusing the editor.
      if (event.defaultPrevented) root.focus({ preventScroll: true });
    };

    return editor.registerRootListener((root, previous) => {
      previous?.removeEventListener("mousedown", onMouseDown);
      root?.addEventListener("mousedown", onMouseDown);
    });
  }, [editor]);

  return null;
}

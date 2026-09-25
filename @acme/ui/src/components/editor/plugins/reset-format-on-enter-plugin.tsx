"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ENTER_COMMAND,
} from "lexical";

/**
 * Notion-style Enter: a new, empty line starts with no inline formatting.
 *
 * Lexical carries the caret's pending format (bold, italic, code…) and text
 * style into the paragraph Enter creates, so typing after a bold line kept
 * typing bold. After the split, if the caret sits in an EMPTY block, both the
 * selection's pending format and the block's stored text format are cleared —
 * an empty paragraph's format is what the next keystroke inherits.
 *
 * Only empty blocks: Enter in the middle of bold text moves real bold text to
 * the new line, and that text keeps its format.
 *
 * Observes rather than handles Enter. List items, check blocks and collapsibles
 * each own Enter for their own node types, and taking the command would have
 * to reproduce all of them; flagging the key and tidying up afterwards leaves
 * every one of those paths as it was.
 */
export function ResetFormatOnEnterPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let pending = false;
    const flag = () => {
      pending = true;
      return false;
    };

    return mergeRegister(
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => (event?.shiftKey ? false : flag()),
        COMMAND_PRIORITY_CRITICAL,
      ),
      // Also reached without a key event, e.g. a virtual keyboard's return.
      editor.registerCommand(
        INSERT_PARAGRAPH_COMMAND,
        flag,
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerUpdateListener(() => {
        if (!pending) return;
        pending = false;

        editor.update(
          () => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
              return;
            }
            const anchor = selection.anchor.getNode();
            const block = $isElementNode(anchor)
              ? anchor
              : $findMatchingParent(anchor, $isElementNode);
            if (!block || block.getTextContentSize() > 0) return;

            if (selection.format !== 0) selection.setFormat(0);
            if (selection.style !== "") selection.setStyle("");
            if (block.getTextFormat() !== 0) block.setTextFormat(0);
            if (block.getTextStyle() !== "") block.setTextStyle("");
          },
          // Part of the Enter, not an undo step of its own.
          { tag: "history-merge" },
        );
      }),
    );
  }, [editor]);

  return null;
}

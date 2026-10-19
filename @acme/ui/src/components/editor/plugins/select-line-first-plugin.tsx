import type { ElementNode, LexicalNode } from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isTableCellNode } from "@lexical/table";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  SELECT_ALL_COMMAND,
} from "lexical";

/** The line a node is in: its table cell, or else its nearest block. */
const $blockOf = (node: LexicalNode) =>
  $findMatchingParent(node, $isTableCellNode) ??
  $findMatchingParent(
    node,
    (candidate): candidate is ElementNode =>
      $isElementNode(candidate) && !candidate.isInline(),
  );

/**
 * Cmd+A as Notion does it: the first press selects the line (block) the caret
 * is in — in a table, the cell — the next one the whole page.
 *
 * "Already selected" is the trigger for the second step, so a line whose text
 * is all selected — by the first press or by hand — goes straight to the
 * page, as does an empty line or a selection across blocks.
 */
export function SelectLineFirstPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      mergeRegister(
        // A triple-click selects its line, and Chrome ends the selection at
        // the start of the next one: Backspace or typing then took that line
        // in too — a to-do below joined the cleared bullet, its checkbox
        // gone. The selection is kept to the line clicked.
        editor.registerCommand(
          CLICK_COMMAND,
          (event) => {
            if (event.detail !== 3) return false;
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || selection.isCollapsed()) {
              return false;
            }
            const [start, end] = selection.isBackward()
              ? [selection.focus, selection.anchor]
              : [selection.anchor, selection.focus];
            const line = $blockOf(start.getNode());
            const next = $blockOf(end.getNode());
            if (!line || !next || line.is(next) || end.offset !== 0) {
              return false;
            }
            const first = next.getFirstDescendant();
            const endNode = end.getNode();
            if (!endNode.is(next) && !(first !== null && endNode.is(first))) {
              return false;
            }
            line.select(0, line.getChildrenSize());
            return false;
          },
          COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
          SELECT_ALL_COMMAND,
          () => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return false;

            // In a table cell, the cell: its lines are one block, as in Notion.
            const block = $blockOf(selection.anchor.getNode());
            if (!block || block !== $blockOf(selection.focus.getNode()))
              return false;

            // A cell's lines join with line breaks a selection's text counts
            // differently, so those do not tell the two apart.
            const lines = (value: string) => value.replaceAll(/\n+/g, "\n");
            const text = lines(block.getTextContent());
            if (text === "" || lines(selection.getTextContent()) === text)
              return false;

            block.select(0, block.getChildrenSize());
            return true;
          },
          // Ahead of the rich-text plugin's own select-all, which takes the page.
          COMMAND_PRIORITY_LOW,
        ),
      ),
    [editor],
  );

  return null;
}

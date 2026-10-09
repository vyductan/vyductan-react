import type { ElementNode } from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isTableCellNode } from "@lexical/table";
import { $findMatchingParent } from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECT_ALL_COMMAND,
} from "lexical";

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
      editor.registerCommand(
        SELECT_ALL_COMMAND,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;

          // In a table cell, the cell: its lines are one block, as in Notion.
          const blockOf = (node: Parameters<typeof $findMatchingParent>[0]) =>
            $findMatchingParent(node, $isTableCellNode) ??
            $findMatchingParent(
              node,
              (candidate): candidate is ElementNode =>
                $isElementNode(candidate) && !candidate.isInline(),
            );
          const block = blockOf(selection.anchor.getNode());
          if (!block || block !== blockOf(selection.focus.getNode()))
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
    [editor],
  );

  return null;
}

import { useEffect } from "react";
import { $isListItemNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
} from "@lexical/table";
import { $findMatchingParent } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  KEY_ENTER_COMMAND,
} from "lexical";

/**
 * Enter in a table cell, as Notion has it: on a line of words it goes to the
 * cell below — Shift+Enter is the new line in a cell. In the last row there
 * is no cell below, and Enter goes on down to the line under the table —
 * made, when the table ends the document. (Notion does nothing there; a key
 * that does nothing was read as broken.) A list keeps its own Enter, the
 * next item.
 */
export function TableCellEnterPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          if (event?.shiftKey || event?.isComposing) return false;
          // A "/", "@" or ":" menu open: Enter is its pick. Lexical marks
          // the root while one is.
          if (editor.getRootElement()?.hasAttribute("aria-controls")) {
            return false;
          }
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return false;
          }
          const anchor = selection.anchor.getNode();
          const cell = $findMatchingParent(anchor, $isTableCellNode);
          if (!cell || $findMatchingParent(anchor, $isListItemNode)) {
            return false;
          }
          const line = $findMatchingParent(
            anchor,
            (node) => node.getParent()?.is(cell) ?? false,
          );
          if (!$isParagraphNode(line ?? anchor)) return false;

          const row = cell.getParent();
          const next = $isTableRowNode(row) ? row.getNextSibling() : null;
          const below = $isTableRowNode(next)
            ? next.getChildAtIndex(cell.getIndexWithinParent())
            : null;
          event?.preventDefault();
          if ($isTableCellNode(below)) {
            below.selectEnd();
            return true;
          }
          const table = $findMatchingParent(cell, $isTableNode);
          if (!table) return true;
          const after = table.getNextSibling();
          if ($isElementNode(after)) {
            after.selectStart();
          } else {
            const line = $createParagraphNode();
            table.insertAfter(line);
            line.select();
          }
          return true;
        },
        // Ahead of the rich-text plugin's Enter, which starts a new line.
        COMMAND_PRIORITY_NORMAL,
      ),
    [editor],
  );

  return null;
}

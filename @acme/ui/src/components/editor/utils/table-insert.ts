import type { TableCellNode, TableRowNode } from "@lexical/table";
import {
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
} from "@lexical/table";
import { $getSelection, $isRangeSelection } from "lexical";

/**
 * Lexical's insert, the caret left plain in a new empty cell. Lexical moves
 * the caret into the new cell but keeps the selection's format: from the
 * end of inline code (where the + button's caret often is), what was typed
 * in the new column came out as code.
 */
function $plainCaretInEmptyCell() {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;
  if (selection.anchor.getNode().getTextContent() !== "") return;
  selection.setFormat(0);
  selection.setStyle("");
}

export function $insertTableColumn(insertAfter: boolean): TableCellNode | null {
  const cell = $insertTableColumnAtSelection(insertAfter);
  $plainCaretInEmptyCell();
  return cell;
}

export function $insertTableRow(insertAfter: boolean): TableRowNode | null {
  const cell = $insertTableRowAtSelection(insertAfter);
  $plainCaretInEmptyCell();
  return cell;
}

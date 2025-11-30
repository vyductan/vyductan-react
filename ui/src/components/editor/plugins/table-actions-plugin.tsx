/**
 * Table Actions Plugin
 * 
 * Plugin để thêm các tính năng nâng cao cho table:
 * - Merge cells
 * - Split cells
 * - Insert row/column
 * - Delete row/column
 */

import type { LexicalCommand, LexicalEditor } from "lexical";
import { useEffect, useState } from "react";
import { Button } from "@acme/ui/components/button";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from "lexical";
import {
  $isTableNode,
  $isTableCellNode,
  $isTableRowNode,
  $createTableCellNode,
  $createTableRowNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  TableCellHeaderStates,
} from "@lexical/table";
import {
  Columns3Icon,
  Rows3Icon,
  CombineIcon,
  SplitIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { $findMatchingParent } from "@lexical/utils";
import { createPortal } from "react-dom";

export const MERGE_TABLE_CELLS_COMMAND: LexicalCommand<void> = createCommand(
  "MERGE_TABLE_CELLS_COMMAND",
);

export const SPLIT_TABLE_CELL_COMMAND: LexicalCommand<void> = createCommand(
  "SPLIT_TABLE_CELL_COMMAND",
);

export const INSERT_TABLE_ROW_COMMAND: LexicalCommand<"above" | "below"> =
  createCommand("INSERT_TABLE_ROW_COMMAND");

export const INSERT_TABLE_COLUMN_COMMAND: LexicalCommand<"left" | "right"> =
  createCommand("INSERT_TABLE_COLUMN_COMMAND");

export const DELETE_TABLE_ROW_COMMAND: LexicalCommand<void> = createCommand(
  "DELETE_TABLE_ROW_COMMAND",
);

export const DELETE_TABLE_COLUMN_COMMAND: LexicalCommand<void> = createCommand(
  "DELETE_TABLE_COLUMN_COMMAND",
);

function TableActionsToolbar({
  editor,
  anchorElem,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
}) {
  const [isInTable, setIsInTable] = useState(false);
  const [canMerge, setCanMerge] = useState(false);
  const [canSplit, setCanSplit] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setIsInTable(false);
          setCanMerge(false);
          setCanSplit(false);
          setPosition(null);
          return;
        }

        const tableCell = $findMatchingParent(
          selection.anchor.getNode(),
          (node) => $isTableCellNode(node),
        );

        if (!tableCell || !$isTableCellNode(tableCell)) {
          setIsInTable(false);
          setCanMerge(false);
          setCanSplit(false);
          setPosition(null);
          return;
        }

        setIsInTable(true);
        setCanSplit(tableCell.getColSpan() > 1 || tableCell.getRowSpan() > 1);

        // Check if multiple cells are selected (can merge)
        const selectedCells = new Set<TableCellNode>();
        const anchorNode = selection.anchor.getNode();
        const focusNode = selection.focus.getNode();

        const anchorCell = $findMatchingParent(anchorNode, (node) =>
          $isTableCellNode(node),
        );
        const focusCell = $findMatchingParent(focusNode, (node) =>
          $isTableCellNode(node),
        );

        if (
          anchorCell &&
          focusCell &&
          $isTableCellNode(anchorCell) &&
          $isTableCellNode(focusCell) &&
          anchorCell !== focusCell
        ) {
          setCanMerge(true);
        } else {
          setCanMerge(false);
        }

        // Calculate position for toolbar
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const anchorRect = anchorElem.getBoundingClientRect();
          setPosition({
            x: rect.left - anchorRect.left + rect.width / 2,
            y: rect.top - anchorRect.top - 10,
          });
        }
      });
    });
  }, [editor, anchorElem]);

  if (!isInTable || !position) {
    return null;
  }

  const handleMerge = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchorNode = selection.anchor.getNode();
      const focusNode = selection.focus.getNode();

      const anchorCell = $findMatchingParent(anchorNode, (node) =>
        $isTableCellNode(node),
      );
      const focusCell = $findMatchingParent(focusNode, (node) =>
        $isTableCellNode(node),
      );

      if (
        !anchorCell ||
        !focusCell ||
        !$isTableCellNode(anchorCell) ||
        !$isTableCellNode(focusCell) ||
        anchorCell === focusCell
      ) {
        return;
      }

      // Get text content from both cells
      const anchorText = anchorCell.getTextContent();
      const focusText = focusCell.getTextContent();
      const mergedText = anchorText + (anchorText && focusText ? " " : "") + focusText;

      // Update anchor cell with merged content
      anchorCell.clear();
      if (mergedText) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(mergedText));
        anchorCell.append(paragraph);
      }

      // Remove focus cell
      focusCell.remove();
    });
  };

  const handleSplit = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const tableCell = $findMatchingParent(
        selection.anchor.getNode(),
        (node) => $isTableCellNode(node),
      );

      if (!tableCell || !$isTableCellNode(tableCell)) return;

      const colSpan = tableCell.getColSpan();
      const rowSpan = tableCell.getRowSpan();

      if (colSpan <= 1 && rowSpan <= 1) return;

      // Simple split: create new cell with same content
      const textContent = tableCell.getTextContent();
      const newCell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
      if (textContent) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(textContent));
        newCell.append(paragraph);
      }

      // Insert new cell after current cell
      const row = tableCell.getParent();
      if ($isTableRowNode(row)) {
        const index = tableCell.getIndexWithinParent();
        row.splice(index + 1, 0, [newCell]);
      }
    });
  };

  const handleInsertRow = (position: "above" | "below") => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const tableCell = $findMatchingParent(
        selection.anchor.getNode(),
        (node) => $isTableCellNode(node),
      );

      if (!tableCell || !$isTableCellNode(tableCell)) return;

      const row = tableCell.getParent();
      if (!$isTableRowNode(row)) return;

      const table = row.getParent();
      if (!$isTableNode(table)) return;

      // Get number of columns from current row
      const columnCount = row.getChildrenSize();
      const newRow = $createTableRowNode();

      // Create cells for new row
      for (let i = 0; i < columnCount; i++) {
        const newCell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
        const paragraph = $createParagraphNode();
        newCell.append(paragraph);
        newRow.append(newCell);
      }

      // Insert row
      const rowIndex = row.getIndexWithinParent();
      if (position === "below") {
        table.splice(rowIndex + 1, 0, [newRow]);
      } else {
        table.splice(rowIndex, 0, [newRow]);
      }
    });
  };

  const handleInsertColumn = (position: "left" | "right") => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const tableCell = $findMatchingParent(
        selection.anchor.getNode(),
        (node) => $isTableCellNode(node),
      );

      if (!tableCell || !$isTableCellNode(tableCell)) return;

      const row = tableCell.getParent();
      if (!$isTableRowNode(row)) return;

      const table = row.getParent();
      if (!$isTableNode(table)) return;

      const cellIndex = tableCell.getIndexWithinParent();

      // Insert cell in all rows
      const rows = table.getChildren();
      for (const tableRow of rows) {
        if ($isTableRowNode(tableRow)) {
          const newCell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
          const paragraph = $createParagraphNode();
          newCell.append(paragraph);

          if (position === "right") {
            tableRow.splice(cellIndex + 1, 0, [newCell]);
          } else {
            tableRow.splice(cellIndex, 0, [newCell]);
          }
        }
      }
    });
  };

  const handleDeleteRow = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const tableCell = $findMatchingParent(
        selection.anchor.getNode(),
        (node) => $isTableCellNode(node),
      );

      if (!tableCell || !$isTableCellNode(tableCell)) return;

      const row = tableCell.getParent();
      if (!$isTableRowNode(row)) return;

      const table = row.getParent();
      if (!$isTableNode(table)) return;

      // Don't delete if it's the last row
      if (table.getChildrenSize() <= 1) return;

      row.remove();
    });
  };

  const handleDeleteColumn = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const tableCell = $findMatchingParent(
        selection.anchor.getNode(),
        (node) => $isTableCellNode(node),
      );

      if (!tableCell || !$isTableCellNode(tableCell)) return;

      const row = tableCell.getParent();
      if (!$isTableRowNode(row)) return;

      const table = row.getParent();
      if (!$isTableNode(table)) return;

      const cellIndex = tableCell.getIndexWithinParent();

      // Don't delete if it's the last column
      if (row.getChildrenSize() <= 1) return;

      // Delete cell from all rows
      const rows = table.getChildren();
      for (const tableRow of rows) {
        if ($isTableRowNode(tableRow)) {
          const cell = tableRow.getChildAtIndex(cellIndex);
          if (cell && $isTableCellNode(cell)) {
            cell.remove();
          }
        }
      }
    });
  };

  return createPortal(
    <div
      className="absolute z-50 flex gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translateX(-50%)",
      }}
    >
      {canMerge && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleMerge}
          title="Merge Cells"
          className="h-8 w-8 p-0"
        >
          <CombineIcon className="size-4" />
        </Button>
      )}
      {canSplit && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSplit}
          title="Split Cell"
          className="h-8 w-8 p-0"
        >
          <SplitIcon className="size-4" />
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleInsertRow("above")}
        title="Insert Row Above"
        className="h-8 w-8 p-0"
      >
        <PlusIcon className="size-4" />
        <Rows3Icon className="size-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleInsertRow("below")}
        title="Insert Row Below"
        className="h-8 w-8 p-0"
      >
        <Rows3Icon className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleInsertColumn("left")}
        title="Insert Column Left"
        className="h-8 w-8 p-0"
      >
        <PlusIcon className="size-4" />
        <Columns3Icon className="size-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleInsertColumn("right")}
        title="Insert Column Right"
        className="h-8 w-8 p-0"
      >
        <Columns3Icon className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDeleteRow}
        title="Delete Row"
        className="h-8 w-8 p-0 text-destructive"
      >
        <TrashIcon className="size-4" />
        <Rows3Icon className="size-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDeleteColumn}
        title="Delete Column"
        className="h-8 w-8 p-0 text-destructive"
      >
        <TrashIcon className="size-4" />
        <Columns3Icon className="size-3" />
      </Button>
    </div>,
    anchorElem,
  );
}

export function TableActionsPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement | null;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([TableNode, TableRowNode, TableCellNode])) {
      throw new Error(
        "TableActionsPlugin: Table nodes not registered on editor",
      );
    }

    // Register commands (handlers are in TableActionsToolbar component)
    const unregister: Array<() => void> = [];

    return () => {
      unregister.forEach((fn) => fn());
    };
  }, [editor]);

  if (!anchorElem) {
    return null;
  }

  return <TableActionsToolbar editor={editor} anchorElem={anchorElem} />;
}


/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import type { TableCellNode } from "@lexical/table";
import type { LexicalNode } from "lexical";
import type { DragEventHandler, JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowNodeFromTableCellNodeOrThrow,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableCellNode,
  $isTableRowNode,
  $isTableSelection,
  $moveTableColumn,
  TableCellHeaderStates,
} from "@lexical/table";
import { mergeRegister } from "@lexical/utils";
import {
  $copyNode,
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
} from "lexical";
import { GripHorizontal, GripVertical } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@acme/ui/components/button";
import { Dropdown } from "@acme/ui/components/dropdown";
import { Switch } from "@acme/ui/components/switch";
import { Icon } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";

type FocusedCellState = {
  cell: HTMLTableCellElement;
  table: HTMLTableElement;
  rowIndex: number;
  columnIndex: number;
};

type DragAxis = "row" | "column";

type DragState = {
  axis: DragAxis;
  originIndex: number;
} | null;

type DropIndicatorState = {
  axis: DragAxis;
  index: number;
  top: number;
  left: number;
  width: number;
  height: number;
} | null;

type ColorSummary =
  | { kind: "none" }
  | { kind: "single"; value: string }
  | { kind: "mixed" };

const TABLE_COLOR_PRESETS = [
  { key: "default", label: "Default", value: null },
  { key: "gray", label: "Gray", value: "#f3f4f6" },
  { key: "red", label: "Red", value: "#fee2e2" },
  { key: "orange", label: "Orange", value: "#ffedd5" },
  { key: "yellow", label: "Yellow", value: "#fef3c7" },
  { key: "green", label: "Green", value: "#dcfce7" },
  { key: "blue", label: "Blue", value: "#dbeafe" },
] as const;

function summarizeColors(
  values: Array<string | null | undefined>,
): ColorSummary {
  const uniqueColors = new Set(values.map((value) => value?.trim() || ""));

  if (
    uniqueColors.size === 0 ||
    (uniqueColors.size === 1 && uniqueColors.has(""))
  ) {
    return { kind: "none" };
  }

  if (uniqueColors.size === 1) {
    const [value] = uniqueColors;
    return value ? { kind: "single", value } : { kind: "none" };
  }

  return { kind: "mixed" };
}

function cloneNodeSubtree(node: LexicalNode): LexicalNode {
  const clonedNode = $copyNode(node);

  if ($isElementNode(node) && $isElementNode(clonedNode)) {
    for (const child of node.getChildren()) {
      clonedNode.append(cloneNodeSubtree(child));
    }
  }

  return clonedNode;
}

function replaceTableCellWithCopy(
  sourceCell: TableCellNode,
  targetCell: TableCellNode,
) {
  targetCell.clear();

  for (const child of sourceCell.getChildren()) {
    targetCell.append(cloneNodeSubtree(child));
  }

  if (targetCell.getChildrenSize() === 0) {
    targetCell.append($createParagraphNode());
  }

  targetCell.setBackgroundColor(sourceCell.getBackgroundColor());
}

function ColorPreview({
  axis,
  summary,
}: {
  axis: "row" | "column";
  summary: ColorSummary;
}) {
  if (summary.kind === "mixed") {
    return (
      <span
        data-testid={`table-action-color-mixed-${axis}`}
        className="border-border inline-flex size-4 items-center justify-center rounded-full border bg-[linear-gradient(135deg,var(--color-muted)_0%,var(--color-muted)_45%,var(--color-foreground)_45%,var(--color-foreground)_55%,var(--color-muted)_55%,var(--color-muted)_100%)]"
      />
    );
  }

  return (
    <span
      data-testid={`table-action-color-preview-${axis}`}
      className="border-border inline-flex size-4 rounded-full border"
      style={{
        backgroundColor:
          summary.kind === "single" ? summary.value : "transparent",
      }}
    />
  );
}

function TableCellActionMenuInner({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [focusedCellState, setFocusedCellState] =
    useState<FocusedCellState | null>(null);
  const [openMenu, setOpenMenu] = useState<"row" | "column" | null>(null);
  const [activeAxis, setActiveAxis] = useState<"row" | "column" | null>(null);
  const [dragState, setDragState] = useState<DragState>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicatorState>(null);
  const dragStateReference = useRef<DragState>(null);
  const focusedCell = focusedCellState?.cell ?? null;
  const focusedTable = focusedCellState?.table ?? null;
  const focusedCellRect = focusedCell?.getBoundingClientRect() ?? null;
  const focusedTableRect = focusedTable?.getBoundingClientRect() ?? null;

  const handleInsertRow = (insertAfter: boolean) => {
    if (!focusedCell) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(focusedCell);
      if (!$isTableCellNode(node)) {
        return;
      }

      const rowNode = $getTableRowNodeFromTableCellNodeOrThrow(node);
      const sourceCells = rowNode.getChildren().filter($isTableCellNode);

      node.selectEnd();
      $insertTableRowAtSelection(insertAfter);

      const insertedRow = insertAfter
        ? rowNode.getNextSibling()
        : rowNode.getPreviousSibling();
      if (!$isTableRowNode(insertedRow)) {
        return;
      }

      const insertedCells = insertedRow.getChildren().filter($isTableCellNode);
      for (const [index, cell] of insertedCells.entries()) {
        const sourceCell = sourceCells[index];
        if (!sourceCell) {
          continue;
        }

        cell.setBackgroundColor(sourceCell.getBackgroundColor());
      }
    });
  };

  const clearDragState = useCallback(() => {
    dragStateReference.current = null;
    setDragState(null);
    setDropIndicator(null);
  }, []);

  const handleRowDragStart = () => {
    const rowIndex = focusedCellState?.rowIndex;
    if (rowIndex == undefined) {
      return;
    }

    const nextDragState = { axis: "row", originIndex: rowIndex } as const;
    setActiveAxis("row");
    setOpenMenu(null);
    dragStateReference.current = nextDragState;
    setDragState(nextDragState);
  };

  const handleRowDragOver = useCallback(
    (event: DragEvent) => {
      const currentDragState = dragStateReference.current;
      if (
        !focusedTable ||
        !currentDragState ||
        currentDragState.axis !== "row"
      ) {
        return;
      }

      event.preventDefault();

      const tableRect = focusedTable.getBoundingClientRect();
      const rows = [...focusedTable.rows];
      const targetRow = rows.find((row) => {
        const rect = row.getBoundingClientRect();
        return event.clientY >= rect.top && event.clientY <= rect.bottom;
      });

      if (!targetRow) {
        setDropIndicator(null);
        return;
      }

      const targetIndex = rows.indexOf(targetRow);
      if (targetIndex <= 0) {
        setDropIndicator(null);
        return;
      }

      const rect = targetRow.getBoundingClientRect();
      const insertAfter = event.clientY >= rect.top + rect.height / 2;
      const indicatorIndex = insertAfter ? targetIndex + 1 : targetIndex;

      setDropIndicator({
        axis: "row",
        index: indicatorIndex,
        top: insertAfter ? rect.bottom - 1 : rect.top - 1,
        left: tableRect.left,
        width: tableRect.width,
        height: 2,
      });
    },
    [focusedTable],
  );

  const handleRowDrop = useCallback(
    (event: DragEvent) => {
      const currentDragState = dragStateReference.current;
      if (
        !focusedCell ||
        !focusedTable ||
        !currentDragState ||
        currentDragState.axis !== "row"
      ) {
        clearDragState();
        return;
      }

      event.preventDefault();

      const rows = [...focusedTable.rows];
      const targetRow = rows.find((row) => {
        const rect = row.getBoundingClientRect();
        return event.clientY >= rect.top && event.clientY <= rect.bottom;
      });

      if (!targetRow) {
        clearDragState();
        return;
      }

      const targetIndex = rows.indexOf(targetRow);
      if (targetIndex <= 0) {
        clearDragState();
        return;
      }

      const targetRect = targetRow.getBoundingClientRect();
      const insertAfter =
        event.clientY >= targetRect.top + targetRect.height / 2;
      const destinationIndex = insertAfter ? targetIndex : targetIndex - 1;

      if (
        destinationIndex === currentDragState.originIndex ||
        destinationIndex < 1
      ) {
        clearDragState();
        return;
      }

      editor.update(() => {
        const node = $getNearestNodeFromDOMNode(focusedCell);
        if (!$isTableCellNode(node)) {
          return;
        }

        const tableNode = $getTableNodeFromLexicalNodeOrThrow(node);
        const rows = tableNode.getChildren().filter($isTableRowNode);
        const originRow = rows[currentDragState.originIndex];
        const destinationRow = rows[destinationIndex];

        if (!originRow || !destinationRow || originRow === destinationRow) {
          return;
        }

        if (currentDragState.originIndex < destinationIndex) {
          destinationRow.insertAfter(originRow);
        } else {
          destinationRow.insertBefore(originRow);
        }
      });

      clearDragState();
    },
    [clearDragState, editor, focusedCell, focusedTable],
  );

  const handleInsertColumn = (insertAfter: boolean) => {
    if (!focusedCell) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(focusedCell);
      if (!$isTableCellNode(node)) {
        return;
      }

      const tableNode = $getTableNodeFromLexicalNodeOrThrow(node);
      const targetColumnIndex = $getTableColumnIndexFromTableCellNode(node);
      const sourceCells = tableNode
        .getChildren()
        .filter($isTableRowNode)
        .map((row) => {
          const sourceCell = row.getChildAtIndex(targetColumnIndex);
          return $isTableCellNode(sourceCell) ? sourceCell : null;
        });

      node.selectEnd();
      $insertTableColumnAtSelection(insertAfter);

      const insertedColumnIndex = insertAfter
        ? targetColumnIndex + 1
        : targetColumnIndex;
      for (const [rowIndex, row] of tableNode
        .getChildren()
        .filter($isTableRowNode)
        .entries()) {
        const insertedCell = row.getChildAtIndex(insertedColumnIndex);
        const sourceCell = sourceCells[rowIndex];
        if ($isTableCellNode(insertedCell) && sourceCell) {
          insertedCell.setBackgroundColor(sourceCell.getBackgroundColor());
        }
      }
    });
  };

  const handleColumnDragStart = () => {
    const columnIndex = focusedCellState?.columnIndex;
    if (columnIndex == undefined) {
      return;
    }

    const nextDragState = { axis: "column", originIndex: columnIndex } as const;
    setActiveAxis("column");
    setOpenMenu(null);
    dragStateReference.current = nextDragState;
    setDragState(nextDragState);
  };

  const handleColumnDragOver = useCallback(
    (event: DragEvent) => {
      const currentDragState = dragStateReference.current;
      if (
        !focusedTable ||
        !currentDragState ||
        currentDragState.axis !== "column"
      ) {
        return;
      }

      event.preventDefault();

      const tableRect = focusedTable.getBoundingClientRect();
      const firstRow = focusedTable.rows.item(0);
      if (!firstRow) {
        setDropIndicator(null);
        return;
      }

      const cells = [...firstRow.cells];
      const targetCell = cells.find((cell) => {
        const rect = cell.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right;
      });

      if (!targetCell) {
        setDropIndicator(null);
        return;
      }

      const targetIndex = cells.indexOf(targetCell);
      const rect = targetCell.getBoundingClientRect();
      const insertAfter = event.clientX >= rect.left + rect.width / 2;
      const indicatorIndex = insertAfter ? targetIndex + 1 : targetIndex;

      setDropIndicator({
        axis: "column",
        index: indicatorIndex,
        top: tableRect.top,
        left: insertAfter ? rect.right - 1 : rect.left - 1,
        width: 2,
        height: tableRect.height,
      });
    },
    [focusedTable],
  );

  const handleColumnDrop = useCallback(
    (event: DragEvent) => {
      const currentDragState = dragStateReference.current;
      if (
        !focusedCell ||
        !focusedTable ||
        !currentDragState ||
        currentDragState.axis !== "column"
      ) {
        clearDragState();
        return;
      }

      event.preventDefault();

      const firstRow = focusedTable.rows.item(0);
      if (!firstRow) {
        clearDragState();
        return;
      }

      const cells = [...firstRow.cells];
      const targetCell = cells.find((cell) => {
        const rect = cell.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right;
      });

      if (!targetCell) {
        clearDragState();
        return;
      }

      const targetIndex = cells.indexOf(targetCell);
      const targetRect = targetCell.getBoundingClientRect();
      const insertAfter =
        event.clientX >= targetRect.left + targetRect.width / 2;
      const destinationIndex = insertAfter
        ? targetIndex
        : Math.max(targetIndex - 1, 0);

      if (destinationIndex === currentDragState.originIndex) {
        clearDragState();
        return;
      }

      editor.update(() => {
        const node = $getNearestNodeFromDOMNode(focusedCell);
        if (!$isTableCellNode(node)) {
          return;
        }

        const tableNode = $getTableNodeFromLexicalNodeOrThrow(node);
        $moveTableColumn(
          tableNode,
          currentDragState.originIndex,
          destinationIndex,
        );
      });

      clearDragState();
    },
    [clearDragState, editor, focusedCell, focusedTable],
  );

  const handleDeleteRow = () => {
    if (!focusedCell) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(focusedCell);
      if ($isTableCellNode(node)) {
        node.selectEnd();
        $deleteTableRowAtSelection();
      }
    });
  };

  const handleDeleteColumn = () => {
    if (!focusedCell) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(focusedCell);
      if ($isTableCellNode(node)) {
        node.selectEnd();
        $deleteTableColumnAtSelection();
      }
    });
  };

  const handleDuplicateRow = () => {
    if (!focusedCell) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(focusedCell);
      if (!$isTableCellNode(node)) {
        return;
      }

      const rowNode = $getTableRowNodeFromTableCellNodeOrThrow(node);
      const sourceCells = rowNode.getChildren().filter($isTableCellNode);

      node.selectEnd();
      $insertTableRowAtSelection(true);

      const duplicateRow = rowNode.getNextSibling();
      if (!$isTableRowNode(duplicateRow)) {
        return;
      }

      const duplicateCells = duplicateRow
        .getChildren()
        .filter($isTableCellNode);
      for (const [index, cell] of duplicateCells.entries()) {
        const sourceCell = sourceCells[index];
        if (sourceCell) {
          replaceTableCellWithCopy(sourceCell, cell);
        }
      }
    });
  };

  const handleDuplicateColumn = () => {
    if (!focusedCell) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(focusedCell);
      if (!$isTableCellNode(node)) {
        return;
      }

      const tableNode = $getTableNodeFromLexicalNodeOrThrow(node);
      const targetColumnIndex = $getTableColumnIndexFromTableCellNode(node);
      const sourceCells = tableNode
        .getChildren()
        .filter($isTableRowNode)
        .map((row) => {
          const sourceCell = row.getChildAtIndex(targetColumnIndex);
          return $isTableCellNode(sourceCell) ? sourceCell : null;
        });

      node.selectEnd();
      $insertTableColumnAtSelection(true);

      const duplicateColumnIndex = targetColumnIndex + 1;
      for (const [rowIndex, row] of tableNode
        .getChildren()
        .filter($isTableRowNode)
        .entries()) {
        const duplicateCell = row.getChildAtIndex(duplicateColumnIndex);
        const sourceCell = sourceCells[rowIndex];
        if ($isTableCellNode(duplicateCell) && sourceCell) {
          replaceTableCellWithCopy(sourceCell, duplicateCell);
        }
      }
    });
  };

  const handleClearRowContents = () => {
    if (!focusedCell) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(focusedCell);
      if (!$isTableCellNode(node)) {
        return;
      }

      const rowNode = $getTableRowNodeFromTableCellNodeOrThrow(node);
      for (const child of rowNode.getChildren()) {
        if ($isTableCellNode(child)) {
          child.clear();
          child.append($createParagraphNode());
        }
      }
    });
  };

  const handleClearColumnContents = () => {
    if (!focusedCell) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(focusedCell);
      if (!$isTableCellNode(node)) {
        return;
      }

      const tableNode = $getTableNodeFromLexicalNodeOrThrow(node);
      const targetColumnIndex = $getTableColumnIndexFromTableCellNode(node);
      for (const row of tableNode.getChildren().filter($isTableRowNode)) {
        const cell = row.getChildAtIndex(targetColumnIndex);
        if ($isTableCellNode(cell)) {
          cell.clear();
          cell.append($createParagraphNode());
        }
      }
    });
  };

  const handleToggleHeader = (axis: "row" | "column") => {
    if (!focusedCell) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(focusedCell);
      if (!$isTableCellNode(node)) {
        return;
      }

      if (axis === "row") {
        const rowNode = $getTableRowNodeFromTableCellNodeOrThrow(node);
        for (const child of rowNode.getChildren()) {
          if ($isTableCellNode(child)) {
            child.toggleHeaderStyle(TableCellHeaderStates.ROW);
          }
        }
        return;
      }

      const tableNode = $getTableNodeFromLexicalNodeOrThrow(node);
      const targetColumnIndex = $getTableColumnIndexFromTableCellNode(node);
      for (const row of tableNode.getChildren().filter($isTableRowNode)) {
        const cell = row.getChildAtIndex(targetColumnIndex);
        if ($isTableCellNode(cell)) {
          cell.toggleHeaderStyle(TableCellHeaderStates.COLUMN);
        }
      }
    });
  };

  const handleSetRowColor = (backgroundColor: string | null) => {
    if (!focusedCell) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(focusedCell);
      if (!$isTableCellNode(node)) {
        return;
      }

      const rowNode = $getTableRowNodeFromTableCellNodeOrThrow(node);
      for (const child of rowNode.getChildren()) {
        if ($isTableCellNode(child)) {
          child.setBackgroundColor(backgroundColor);
        }
      }
    });
  };

  const handleSetColumnColor = (backgroundColor: string | null) => {
    if (!focusedCell) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(focusedCell);
      if (!$isTableCellNode(node)) {
        return;
      }

      const tableNode = $getTableNodeFromLexicalNodeOrThrow(node);
      const targetColumnIndex = $getTableColumnIndexFromTableCellNode(node);
      for (const row of tableNode.getChildren().filter($isTableRowNode)) {
        const cell = row.getChildAtIndex(targetColumnIndex);
        if ($isTableCellNode(cell)) {
          cell.setBackgroundColor(backgroundColor);
        }
      }
    });
  };

  const rowIndex = focusedCellState?.rowIndex ?? 0;
  const columnIndex = focusedCellState?.columnIndex ?? 0;
  const rowHeaderEnabled = focusedCell?.tagName === "TH" && rowIndex === 0;
  const columnHeaderEnabled = focusedCell?.tagName === "TH";
  const rowColorSummary = summarizeColors(
    focusedCellState?.table.rows[rowIndex]
      ? [...focusedCellState.table.rows[rowIndex].cells].map(
          (cell) =>
            (cell as HTMLTableCellElement).style.backgroundColor || null,
        )
      : [],
  );
  const columnColorSummary = summarizeColors(
    focusedCellState?.table
      ? [...focusedCellState.table.rows].map(
          (row) =>
            (row.cells[columnIndex] as HTMLTableCellElement | undefined)?.style
              .backgroundColor || null,
        )
      : [],
  );

  useEffect(() => {
    const setFocusedCellFromElement = (element: HTMLElement | null) => {
      const editorRoot = editor.getRootElement();
      const isOnActionHandle =
        element?.closest(".EditorTheme__tableCellActionMenuHandle") !== null;
      const isInsideOpenMenu =
        element?.closest('[data-slot="dropdown-menu-content"]') !== null ||
        element?.closest('[data-slot="dropdown-menu-sub-content"]') !== null;
      const cell = element?.closest<HTMLTableCellElement>("td, th") ?? null;
      const table = cell?.closest<HTMLTableElement>("table") ?? null;

      if (isOnActionHandle || isInsideOpenMenu) {
        return;
      }

      if (!editorRoot || !cell || !table || !editorRoot.contains(table)) {
        setFocusedCellState(null);
        setOpenMenu(null);
        setActiveAxis((current) => (dragStateReference.current ? current : null));
        return;
      }

      const row = cell.closest("tr");

      setFocusedCellState({
        cell,
        table,
        rowIndex: row instanceof HTMLTableRowElement ? row.rowIndex : 0,
        columnIndex: cell.cellIndex,
      });
    };

    const syncFocusedCellFromSelection = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isTableSelection(selection)) {
          setFocusedCellState(null);
          setOpenMenu(null);
          setActiveAxis((current) => (dragStateReference.current ? current : null));
          return;
        }

        if (!$isRangeSelection(selection)) {
          return;
        }

        const anchorNode = selection.anchor.getNode();
        const tableCellNode = $isTableCellNode(anchorNode)
          ? anchorNode
          : anchorNode.getParents().find((node) => $isTableCellNode(node));

        if (!$isTableCellNode(tableCellNode)) {
          setFocusedCellState(null);
          setOpenMenu(null);
          setActiveAxis((current) => (dragStateReference.current ? current : null));
          return;
        }

        const element = editor.getElementByKey(tableCellNode.getKey());
        setFocusedCellFromElement(element as HTMLTableCellElement | null);
      });
    };

    const handleMouseUp = (event: MouseEvent) => {
      setFocusedCellFromElement(event.target as HTMLElement | null);
    };

    const handleDocumentDragOver = (event: DragEvent) => {
      handleRowDragOver(event);
      handleColumnDragOver(event);
    };

    const handleDocumentDrop = (event: DragEvent) => {
      handleRowDrop(event);
      handleColumnDrop(event);
    };

    syncFocusedCellFromSelection();

    return mergeRegister(
      editor.registerUpdateListener(() => {
        syncFocusedCellFromSelection();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setFocusedCellState(null);
          clearDragState();
          setOpenMenu(null);
          setActiveAxis(null);
        }
      }),
      (() => {
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("dragover", handleDocumentDragOver);
        document.addEventListener("drop", handleDocumentDrop);
        document.addEventListener("dragend", clearDragState);

        return () => {
          document.removeEventListener("mouseup", handleMouseUp);
          document.removeEventListener("dragover", handleDocumentDragOver);
          document.removeEventListener("drop", handleDocumentDrop);
          document.removeEventListener("dragend", clearDragState);
        };
      })(),
    );
  }, [
    clearDragState,
    editor,
    handleColumnDragOver,
    handleColumnDrop,
    handleRowDragOver,
    handleRowDrop,
  ]);

  const handleRowButtonDragOver: DragEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    handleRowDragOver(event.nativeEvent);
  };

  const handleRowButtonDrop: DragEventHandler<HTMLButtonElement> = (event) => {
    handleRowDrop(event.nativeEvent);
  };

  const handleColumnButtonDragOver: DragEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    handleColumnDragOver(event.nativeEvent);
  };

  const handleColumnButtonDrop: DragEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    handleColumnDrop(event.nativeEvent);
  };

  const rowMenu = {
    items: [
      { key: "search", label: "Search actions...", disabled: true },
      ...(rowIndex === 0
        ? [
            {
              key: "header-row",
              label: "Header row",
              icon: <Icon className="size-4" icon="icon-[lucide--rows-3]" />,
              extra: (
                <Switch
                  checked={rowHeaderEnabled}
                  size="small"
                  tabIndex={-1}
                  aria-hidden="true"
                  data-testid="table-action-toggle-header-row"
                  className="pointer-events-none"
                />
              ),
              onClick: () => handleToggleHeader("row"),
            },
          ]
        : []),
      {
        key: "color",
        label: "Color",
        icon: <Icon className="size-4" icon="icon-[lucide--palette]" />,
        extra: <ColorPreview axis="row" summary={rowColorSummary} />,
        children: TABLE_COLOR_PRESETS.map((preset) => ({
          key: `row-color-${preset.key}`,
          label: preset.label,
          icon:
            preset.value === null ? (
              <Icon className="size-4" icon="icon-[lucide--ban]" />
            ) : (
              <span
                className="border-border size-4 rounded-full border"
                style={{ backgroundColor: preset.value }}
              />
            ),
          onClick: () => handleSetRowColor(preset.value),
        })),
      },
      { type: "divider" as const },
      {
        key: "insert-above",
        label: "Insert above",
        icon: <Icon className="size-4" icon="icon-[lucide--arrow-up]" />,
        onClick: () => handleInsertRow(false),
      },
      {
        key: "insert-below",
        label: "Insert below",
        icon: <Icon className="size-4" icon="icon-[lucide--arrow-down]" />,
        onClick: () => handleInsertRow(true),
      },
      {
        key: "duplicate-row",
        label: "Duplicate",
        icon: <Icon className="size-4" icon="icon-[lucide--copy]" />,
        onClick: handleDuplicateRow,
      },
      {
        key: "clear-row",
        label: "Clear contents",
        icon: <Icon className="size-4" icon="icon-[lucide--eraser]" />,
        onClick: handleClearRowContents,
      },
      {
        key: "delete-row",
        label: "Delete",
        icon: (
          <Icon className="size-4 text-red-500" icon="icon-[lucide--trash]" />
        ),
        danger: true,
        onClick: handleDeleteRow,
      },
    ],
  };

  const columnMenu = {
    items: [
      { key: "search", label: "Search actions...", disabled: true },
      {
        key: "header-column",
        label: "Header column",
        icon: <Icon className="size-4" icon="icon-[lucide--columns-2]" />,
        extra: (
          <Switch
            checked={columnHeaderEnabled}
            size="small"
            tabIndex={-1}
            aria-hidden="true"
            data-testid="table-action-toggle-header-column"
            className="pointer-events-none"
          />
        ),
        onClick: () => handleToggleHeader("column"),
      },
      {
        key: "color",
        label: "Color",
        icon: <Icon className="size-4" icon="icon-[lucide--palette]" />,
        extra: <ColorPreview axis="column" summary={columnColorSummary} />,
        children: TABLE_COLOR_PRESETS.map((preset) => ({
          key: `column-color-${preset.key}`,
          label: preset.label,
          icon:
            preset.value === null ? (
              <Icon className="size-4" icon="icon-[lucide--ban]" />
            ) : (
              <span
                className="border-border size-4 rounded-full border"
                style={{ backgroundColor: preset.value }}
              />
            ),
          onClick: () => handleSetColumnColor(preset.value),
        })),
      },
      { type: "divider" as const },
      {
        key: "insert-left",
        label: "Insert left",
        icon: <Icon className="size-4" icon="icon-[lucide--arrow-left]" />,
        onClick: () => handleInsertColumn(false),
      },
      {
        key: "insert-right",
        label: "Insert right",
        icon: <Icon className="size-4" icon="icon-[lucide--arrow-right]" />,
        onClick: () => handleInsertColumn(true),
      },
      {
        key: "duplicate-column",
        label: "Duplicate",
        icon: <Icon className="size-4" icon="icon-[lucide--copy]" />,
        onClick: handleDuplicateColumn,
      },
      {
        key: "clear-column",
        label: "Clear contents",
        icon: <Icon className="size-4" icon="icon-[lucide--eraser]" />,
        onClick: handleClearColumnContents,
      },
      {
        key: "delete-column",
        label: "Delete",
        icon: (
          <Icon className="size-4 text-red-500" icon="icon-[lucide--trash]" />
        ),
        danger: true,
        onClick: handleDeleteColumn,
      },
    ],
  };

  if (!focusedCell || !focusedCellRect || !focusedTable || !focusedTableRect) {
    return null;
  }

  return createPortal(
    <>
      <div
        aria-hidden="true"
        className={cn(
          "EditorTheme__tableCellActionMenuHighlight border-primary/70 bg-primary/5 pointer-events-none fixed z-40 rounded-md border-2",
          activeAxis === "row" ? "opacity-100" : "opacity-0",
        )}
        style={{
          top: focusedCellRect.top,
          left: focusedTableRect.left,
          width: focusedTableRect.width,
          height: focusedCellRect.height,
        }}
      />
      <div
        aria-hidden="true"
        className={cn(
          "EditorTheme__tableCellActionMenuHighlight border-primary/70 bg-primary/5 pointer-events-none fixed z-40 rounded-md border-2",
          activeAxis === "column" ? "opacity-100" : "opacity-0",
        )}
        style={{
          top: focusedTableRect.top,
          left: focusedCellRect.left,
          width: focusedCellRect.width,
          height: focusedTableRect.height,
        }}
      />
      {dropIndicator ? (
        <div
          aria-hidden="true"
          data-table-drop-indicator={dropIndicator.axis}
          data-table-drop-index={dropIndicator.index}
          className="EditorTheme__tableCellActionMenuDropIndicator"
          style={{
            top: dropIndicator.top,
            left: dropIndicator.left,
            width: dropIndicator.width,
            height: dropIndicator.height,
          }}
        />
      ) : null}
      <div
        style={{
          position: "fixed",
          top: focusedCellRect.top + focusedCellRect.height / 2 - 10,
          left: focusedTableRect.left - 28,
          zIndex: 50,
        }}
      >
        <Dropdown
          open={openMenu === "row"}
          onOpenChange={(open) => {
            setOpenMenu(open ? "row" : null);
            setActiveAxis(open ? "row" : null);
          }}
          menu={rowMenu}
          placement="bottomLeft"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Row actions"
            draggable
            className="EditorTheme__tableCellActionMenuHandle bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground h-5 w-5 rounded-md border"
            onMouseEnter={() => setActiveAxis("row")}
            onMouseLeave={() => {
              if (openMenu !== "row" && !dragState) {
                setActiveAxis(null);
              }
            }}
            onClick={() => {
              setActiveAxis("row");
              setOpenMenu((current) => (current === "row" ? null : "row"));
            }}
            onDragStart={handleRowDragStart}
            onDragOver={handleRowButtonDragOver}
            onDrop={handleRowButtonDrop}
            onDragEnd={clearDragState}
            data-table-row-index={rowIndex}
          >
            <GripVertical className="size-3.5" />
          </Button>
        </Dropdown>
      </div>
      <div
        style={{
          position: "fixed",
          top: focusedTableRect.top - 28,
          left: focusedCellRect.left + focusedCellRect.width / 2 - 10,
          zIndex: 50,
        }}
      >
        <Dropdown
          open={openMenu === "column"}
          onOpenChange={(open) => {
            setOpenMenu(open ? "column" : null);
            setActiveAxis(open ? "column" : null);
          }}
          menu={columnMenu}
          placement="bottomLeft"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Column actions"
            draggable
            className="EditorTheme__tableCellActionMenuHandle bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground h-5 w-5 rounded-md border"
            onMouseEnter={() => setActiveAxis("column")}
            onMouseLeave={() => {
              if (openMenu !== "column" && !dragState) {
                setActiveAxis(null);
              }
            }}
            onClick={() => {
              setActiveAxis("column");
              setOpenMenu((current) =>
                current === "column" ? null : "column",
              );
            }}
            onDragStart={handleColumnDragStart}
            onDragOver={handleColumnButtonDragOver}
            onDrop={handleColumnButtonDrop}
            onDragEnd={clearDragState}
            data-table-column-index={columnIndex}
          >
            <GripHorizontal className="size-3.5" />
          </Button>
        </Dropdown>
      </div>
    </>,
    anchorElem,
  );
}

export function TableCellActionMenuPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement | null;
}): JSX.Element | null {
  if (!anchorElem) return null;
  return <TableCellActionMenuInner anchorElem={anchorElem} />;
}

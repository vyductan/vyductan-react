/**
 * TableHoverActionsPlugin
 *
 * Notion-style table hover UX:
 * - Hover the right edge of the table → show "+" button to add a column
 * - Hover the bottom edge of the table → show "+" button to add a row
 */

import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableCellNode,
} from "@lexical/table";
import { $getNearestNodeFromDOMNode } from "lexical";
import { PlusIcon } from "lucide-react";
import { createPortal } from "react-dom";

// How many px outside the table boundary we still consider "hovering the table"
const HOVER_MARGIN_PX = 36;

type ButtonState = {
  /** Which button to show */
  kind: "column" | "row";
  /** Fixed-position x for the button center */
  x: number;
  /** Fixed-position y for the button center */
  y: number;
  /** Height of the vertical stripe (for "column" button) */
  stripeHeight: number;
  /** Width of the horizontal stripe (for "row" button) */
  stripeWidth: number;
  /** The last-column cell to use as insertion anchor */
  anchorCell: HTMLTableCellElement;
} | null;

function TableHoverActionsInner({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [buttonState, setButtonState] = useState<ButtonState>(null);
  // Track the table element that is currently "active" so we can keep the
  // button visible while the user moves the mouse along the stripe.
  const activeTableRef = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    const editorRoot = editor.getRootElement();
    if (!editorRoot) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      // Walk up from the hovered element to find a table cell / table
      const target = e.target as HTMLElement | null;
      if (!target) {
        setButtonState(null);
        activeTableRef.current = null;
        return;
      }

      // Find the closest table that belongs to this editor
      const cell = target.closest<HTMLTableCellElement>("td, th");
      const table = cell?.closest<HTMLTableElement>("table");

      // The mouse might be on the button itself (portal child) – keep showing it
      const isOnButton =
        (e.target as HTMLElement)?.closest("[data-table-hover-btn]") !== null;
      if (isOnButton) return;

      if (!table || !editorRoot.contains(table)) {
        // Check if mouse is close enough to the previously active table
        const prevTable = activeTableRef.current;
        if (prevTable) {
          const rect = prevTable.getBoundingClientRect();
          const nearRight =
            clientX >= rect.right - 4 &&
            clientX <= rect.right + HOVER_MARGIN_PX &&
            clientY >= rect.top &&
            clientY <= rect.bottom;
          const nearBottom =
            clientY >= rect.bottom - 4 &&
            clientY <= rect.bottom + HOVER_MARGIN_PX &&
            clientX >= rect.left &&
            clientX <= rect.right;
          if (nearRight || nearBottom) {
            // Keep existing button state
            return;
          }
        }
        setButtonState(null);
        activeTableRef.current = null;
        return;
      }

      activeTableRef.current = table;
      const tableRect = table.getBoundingClientRect();

      // Determine if we're in the "right stripe" or the "bottom stripe"
      const distToRight = tableRect.right - clientX;
      const distToBottom = tableRect.bottom - clientY;

      const inRightStripe =
        distToRight >= 0 &&
        distToRight <= HOVER_MARGIN_PX &&
        clientY >= tableRect.top &&
        clientY <= tableRect.bottom;

      const inBottomStripe =
        distToBottom >= 0 &&
        distToBottom <= HOVER_MARGIN_PX &&
        clientX >= tableRect.left &&
        clientX <= tableRect.right;

      if (!inRightStripe && !inBottomStripe) {
        setButtonState(null);
        return;
      }

      // Pick the last cell of the last row as the anchor for inserting
      const rows = table.rows;
      if (rows.length === 0) {
        setButtonState(null);
        return;
      }
      const lastRow = [...rows].at(-1);
      const firstRow = rows[0];
      const firstRowLastCell = firstRow
        ? [...firstRow.cells].at(-1)
        : undefined;
      const lastRowLastCell = lastRow ? [...lastRow.cells].at(-1) : undefined;

      if (inRightStripe) {
        if (!firstRowLastCell) return;
        setButtonState({
          kind: "column",
          x: tableRect.right,
          y: tableRect.top + tableRect.height / 2,
          stripeHeight: tableRect.height,
          stripeWidth: 0,
          anchorCell: firstRowLastCell,
        });
      } else {
        if (!lastRowLastCell) return;
        setButtonState({
          kind: "row",
          x: tableRect.left + tableRect.width / 2,
          y: tableRect.bottom,
          stripeHeight: 0,
          stripeWidth: tableRect.width,
          anchorCell: lastRowLastCell,
        });
      }
    };

    const handleMouseLeave = () => {
      // Small delay so moving to the stripe/button doesn't flicker
      setTimeout(() => {
        const isOnButton =
          document.querySelector("[data-table-hover-btn]:hover") !== null;
        if (!isOnButton) {
          setButtonState(null);
          activeTableRef.current = null;
        }
      }, 50);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    editorRoot.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      editorRoot.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [editor]);

  if (!buttonState) return null;

  const handleAddColumn = () => {
    const cell = buttonState?.anchorCell;
    if (!cell) return;
    editor.update(() => {
      const cellNode = $getNearestNodeFromDOMNode(cell);
      if ($isTableCellNode(cellNode)) {
        cellNode.selectEnd();
        $insertTableColumnAtSelection(false);
      }
    });
    setButtonState(null);
  };

  const handleAddRow = () => {
    const cell = buttonState?.anchorCell;
    if (!cell) return;
    editor.update(() => {
      const cellNode = $getNearestNodeFromDOMNode(cell);
      if ($isTableCellNode(cellNode)) {
        cellNode.selectEnd();
        $insertTableRowAtSelection(false);
      }
    });
    setButtonState(null);
  };

  const isColumn = buttonState.kind === "column";

  return createPortal(
    <div
      data-table-hover-btn
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 50,
        // Position the stripe
        ...(isColumn
          ? {
              top: buttonState.y - buttonState.stripeHeight / 2,
              left: buttonState.x,
              width: 28,
              height: buttonState.stripeHeight,
            }
          : {
              top: buttonState.y,
              left: buttonState.x - buttonState.stripeWidth / 2,
              width: buttonState.stripeWidth,
              height: 28,
            }),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background stripe */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "hsl(var(--muted))",
          borderRadius: isColumn ? "0 4px 4px 0" : "0 0 4px 4px",
          opacity: 0.8,
        }}
      />

      {/* "+" button */}
      <button
        type="button"
        onClick={isColumn ? handleAddColumn : handleAddRow}
        title={
          isColumn ? "Click to add a new column" : "Click to add a new row"
        }
        style={{ pointerEvents: "all" }}
        className="border-border bg-background text-muted-foreground hover:border-primary hover:text-primary relative z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border shadow-sm transition-all hover:shadow-md"
      >
        <PlusIcon className="size-3.5" />
      </button>
    </div>,
    anchorElem,
  );
}

export function TableHoverActionsPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement | null;
}): JSX.Element | null {
  if (!anchorElem) return null;
  return <TableHoverActionsInner anchorElem={anchorElem} />;
}

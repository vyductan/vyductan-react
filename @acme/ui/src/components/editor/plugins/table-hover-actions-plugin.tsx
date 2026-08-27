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
import { $getNearestNodeFromDOMNode, COMMAND_PRIORITY_LOW } from "lexical";
import { PlusIcon } from "lucide-react";
import { createPortal } from "react-dom";

import { TABLE_COLUMN_RESIZE_DRAG_COMMAND } from "./table-column-resize-plugin";

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

/**
 * Where the button belongs for a pointer at this point over this table, or null
 * if it does not belong anywhere. Every read is live off the DOM, so calling it
 * after a resize places the button against the column's new width.
 *
 * The stripes reach HOVER_MARGIN_PX to BOTH sides of the edge. Outside matters
 * as much as inside: a pointer approaching the right edge across the margin
 * resolves to no cell at all, and while this only looked inward, arriving that
 * way raised nothing.
 */
function resolveButtonState(
  table: HTMLTableElement,
  clientX: number,
  clientY: number,
): ButtonState {
  const tableRect = table.getBoundingClientRect();
  const distributionToRight = tableRect.right - clientX;
  const distributionToBottom = tableRect.bottom - clientY;

  const inRightStripe =
    Math.abs(distributionToRight) <= HOVER_MARGIN_PX &&
    clientY >= tableRect.top &&
    clientY <= tableRect.bottom;

  const inBottomStripe =
    Math.abs(distributionToBottom) <= HOVER_MARGIN_PX &&
    clientX >= tableRect.left &&
    clientX <= tableRect.right;

  if (!inRightStripe && !inBottomStripe) return null;

  const rows = table.rows;
  const firstRowLastCell = rows[0] ? [...rows[0].cells].at(-1) : undefined;
  const lastRow = [...rows].at(-1);
  const lastRowLastCell = lastRow ? [...lastRow.cells].at(-1) : undefined;

  // A row with no cells cannot anchor an insert, so there is nothing to show.
  if (inRightStripe) {
    if (!firstRowLastCell) return null;
    return {
      kind: "column",
      x: tableRect.right,
      y: tableRect.top + tableRect.height / 2,
      stripeHeight: tableRect.height,
      stripeWidth: 0,
      anchorCell: firstRowLastCell,
    };
  }

  if (!lastRowLastCell) return null;
  return {
    kind: "row",
    x: tableRect.left + tableRect.width / 2,
    y: tableRect.bottom,
    stripeHeight: 0,
    stripeWidth: tableRect.width,
    anchorCell: lastRowLastCell,
  };
}

function TableHoverActionsInner({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [buttonState, setButtonState] = useState<ButtonState>(null);
  // Track the table element that is currently "active" so we can keep the
  // button visible while the user moves the mouse along the stripe.
  const activeTableReference = useRef<HTMLTableElement | null>(null);
  // Refs, not state: the mousemove handler below is registered once and has to
  // read live values, and none of this needs a re-render of its own.
  const columnDragActiveReference = useRef(false);

  useEffect(
    () =>
      editor.registerCommand(
        TABLE_COLUMN_RESIZE_DRAG_COMMAND,
        (payload) => {
          columnDragActiveReference.current = payload.active;

          if (payload.active) {
            setButtonState(null);
            return false;
          }

          // Releasing the grabber brings the button straight back rather than
          // waiting for a pointer move: the pointer is sitting on the boundary
          // it just dragged, which is the table's right edge when that was the
          // last column. Re-resolved rather than restored, because the drag
          // moved that edge — and the DOM already carries the new widths, since
          // every pointermove wrote them to the <col> elements.
          const table = activeTableReference.current;
          if (table) {
            setButtonState(
              resolveButtonState(table, payload.clientX, payload.clientY),
            );
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor],
  );

  useEffect(() => {
    const editorRoot = editor.getRootElement();
    if (!editorRoot) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Backstop only. Pointer capture retargets the compatibility mouse events
      // to the grabber for the duration of a drag, so the resizer guard below
      // already catches every move — verified by removing this line and having
      // the drag story stay green, even dragging across other cells and off the
      // table. Kept because that retargeting is the one thing here we rely on a
      // browser to get right, and the check is a boolean read.
      if (columnDragActiveReference.current) return;

      const { clientX, clientY } = e;

      // Walk up from the hovered element to find a table cell / table
      const target = e.target as HTMLElement | null;
      if (!target) {
        setButtonState(null);
        activeTableReference.current = null;
        return;
      }

      // Find the closest table that belongs to this editor
      const cell = target.closest<HTMLTableCellElement>("td, th");
      const table = cell?.closest<HTMLTableElement>("table");

      // The mouse might be on the button itself (portal child) – keep showing it
      const isOnButton =
        (e.target as HTMLElement)?.closest("[data-table-hover-btn]") !== null;
      if (isOnButton) return;

      // Same for the column resizer, which shares the table's right edge with
      // this button and is portalled outside the table too. The `nearRight`
      // fallback below already covers the pointer sitting on the LAST column's
      // boundary; this makes the intent explicit and also covers the case where
      // no table has been seen yet, so `previousTable` is null.
      if (target.closest("[data-table-column-resizer]")) {
        return;
      }

      if (!table || !editorRoot.contains(table)) {
        // Off any cell: the pointer may still be in the margin alongside the
        // table it was last on. Resolve against that table rather than keeping
        // whatever was already up — keeping meant a pointer that entered the
        // margin from outside raised nothing, since there was nothing to keep.
        const previousTable = activeTableReference.current;
        const next = previousTable
          ? resolveButtonState(previousTable, clientX, clientY)
          : null;

        setButtonState(next);
        if (!next) activeTableReference.current = null;
        return;
      }

      activeTableReference.current = table;
      setButtonState(resolveButtonState(table, clientX, clientY));
    };

    // Both of these live outside the editor root, so crossing onto either one
    // raises `mouseleave` even though the pointer is still working on the
    // table. Tearing down there is what hid the button under the user's cursor.
    const tableAffordances = [
      "[data-table-hover-btn]",
      "[data-table-column-resizer]",
    ];

    const handleMouseLeave = (event: MouseEvent) => {
      const relatedTarget = event.relatedTarget;
      const movingToAffordance =
        relatedTarget instanceof Element &&
        tableAffordances.some(
          (selector) => relatedTarget.closest(selector) !== null,
        );
      if (movingToAffordance) return;

      // Small delay so moving to the stripe/button doesn't flicker
      setTimeout(() => {
        const stillOnAffordance = tableAffordances.some(
          (selector) => document.querySelector(`${selector}:hover`) !== null,
        );
        if (stillOnAffordance) return;
        setButtonState(null);
        activeTableReference.current = null;
      }, 50);
    };

    /**
     * Notion hides this button as soon as you type: the cell grows under the
     * caret and a button measured before the keystroke is left sitting in the
     * middle of the text. The next pointer move brings it back, correctly
     * placed. Only content-changing keys count — arrows and modifiers move the
     * caret without reflowing anything.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const isTextKey = [...event.key].length === 1;
      const isEditKey =
        event.key === "Enter" ||
        event.key === "Backspace" ||
        event.key === "Delete";
      if (isTextKey || isEditKey) setButtonState(null);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    editorRoot.addEventListener("mouseleave", handleMouseLeave);
    editorRoot.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      editorRoot.removeEventListener("mouseleave", handleMouseLeave);
      editorRoot.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  const handleAddColumn = (cell: HTMLTableCellElement | null) => {
    if (!cell) return;
    editor.update(() => {
      const cellNode = $getNearestNodeFromDOMNode(cell);
      if ($isTableCellNode(cellNode)) {
        cellNode.selectEnd();
        $insertTableColumnAtSelection(true);
      }
    });
    setButtonState(null);
  };

  const handleAddRow = (cell: HTMLTableCellElement | null) => {
    if (!cell) return;
    editor.update(() => {
      const cellNode = $getNearestNodeFromDOMNode(cell);
      if ($isTableCellNode(cellNode)) {
        cellNode.selectEnd();
        $insertTableRowAtSelection(true);
      }
    });
    setButtonState(null);
  };

  const anchorRect = anchorElem.getBoundingClientRect();
  const isHoverMode = buttonState !== null;
  const isColumn = buttonState?.kind === "column";

  if (!isHoverMode) {
    return null;
  }

  const portalContent = (
    <div
      data-table-hover-btn
      style={{
        // Absolute against the portal target, not fixed against the viewport.
        // `fixed` silently re-anchors to any ancestor that establishes a
        // containing block (a transform, filter, or `contain`), which is what a
        // Storybook docs page does — the button then lands hundreds of px from
        // its table. The portal target also lives inside the scroll container,
        // so these offsets need no scroll listener.
        position: "absolute",
        pointerEvents: "none",
        zIndex: 50,
        ...(isColumn
          ? {
              top:
                buttonState.y - buttonState.stripeHeight / 2 - anchorRect.top,
              left: buttonState.x - anchorRect.left,
              width: 24,
              height: buttonState.stripeHeight,
            }
          : {
              top: buttonState.y - anchorRect.top,
              left:
                buttonState.x - buttonState.stripeWidth / 2 - anchorRect.left,
              width: buttonState.stripeWidth,
              height: 24,
            }),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        type="button"
        onClick={() =>
          isColumn
            ? handleAddColumn(buttonState.anchorCell)
            : handleAddRow(buttonState.anchorCell)
        }
        title={
          isColumn ? "Click to add a new column" : "Click to add a new row"
        }
        style={{ pointerEvents: "all" }}
        className={
          isColumn
            ? "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 relative z-10 flex h-[calc(100%-8px)] w-4 cursor-pointer items-center justify-center overflow-hidden rounded-r border shadow-sm transition-all hover:shadow-md"
            : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 relative z-10 flex h-4 w-[calc(100%-8px)] cursor-pointer items-center justify-center overflow-hidden rounded-b border shadow-sm transition-all hover:shadow-md"
        }
      >
        <PlusIcon className="size-3 shrink-0" />
      </button>
    </div>
  );

  return createPortal(portalContent, anchorElem);
}

export function TableHoverActionsPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement | null;
}): JSX.Element | null {
  if (!anchorElem) return null;
  return <TableHoverActionsInner anchorElem={anchorElem} />;
}

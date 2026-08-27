/**
 * TableColumnResizePlugin
 *
 * Notion-style column resizing: hovering a column boundary raises a full-height
 * grabber, and dragging it widens or narrows that one column.
 *
 * The width model is @lexical/table's own `TableNode.colWidths`, not a
 * hand-rolled one. That buys serialization (`colWidths` is a field on
 * `SerializedTableNode`), the `<colgroup>` the editor renders, HTML
 * import/export, and — the expensive part — width bookkeeping across column
 * insert, delete and move, all of which `$tableTransform` already maintains via
 * the `<TablePlugin />` this editor mounts.
 */

import type { JSX, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getTableNodeFromLexicalNodeOrThrow,
  $isSimpleTable,
  $isTableNode,
} from "@lexical/table";
import { $getNearestNodeFromDOMNode, $getNodeByKey } from "lexical";
import { createPortal } from "react-dom";

import {
  applyResizeToColWidths,
  columnWidthsFromBoundaries,
  RESIZE_HIT_PX,
  resolveColWidths,
} from "./table-column-resize-model";

/** Width of the invisible grab strip, centred on the boundary. */
const GRABBER_WIDTH = 8;

type Grabber = {
  table: HTMLTableElement;
  tableKey: string;
  /** Index of the column whose RIGHT edge this boundary is. */
  columnIndex: number;
  /** Viewport coordinates; converted to anchor-relative at render. */
  boundaryX: number;
  tableTop: number;
  tableHeight: number;
};

type Drag = {
  tableKey: string;
  columnIndex: number;
  startX: number;
  startWidths: number[];
  currentWidths: number[];
};

/** The `<col>` elements Lexical generates for a table's colgroup. */
function colElementsOf(table: HTMLTableElement) {
  return [
    ...table.querySelectorAll<HTMLTableColElement>(":scope > colgroup > col"),
  ];
}

function TableColumnResizeInner({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [grabber, setGrabber] = useState<Grabber | null>(null);
  /**
   * The ruler while dragging, in viewport px.
   *
   * `x` is derived from the clamped widths rather than from the pointer: past
   * the floor or the ceiling the column stops moving, and a ruler that kept
   * following the pointer drifted into the middle of a column that was refusing
   * to resize.
   *
   * `top`/`height` are re-measured on every move, because narrowing a column
   * wraps its text and the table grows taller mid-drag — the height captured on
   * hover left the line stopping short of the table it was marking.
   */
  const [ruler, setRuler] = useState<{
    x: number;
    top: number;
    height: number;
  } | null>(null);
  const dragReference = useRef<Drag | null>(null);

  /**
   * Push widths straight onto the colgroup rather than through `editor.update`.
   *
   * Safe for two specific reasons, both of which have to keep holding: the
   * colgroup is `setDOMUnmanaged`, so the reconciler never touches it, and
   * `updateTableElement` only regenerates it when `getColWidths()` changes by
   * reference — which cannot happen while we are not calling `setColWidths`.
   * An update per pointermove would instead reconcile and push history on every
   * frame.
   */
  const previewWidths = useCallback(
    (table: HTMLTableElement, widths: readonly number[]) => {
      const cols = colElementsOf(table);

      for (const [index, col] of cols.entries()) {
        const width = widths[index];
        if (width !== undefined) {
          col.style.width = `${width}px`;
        }
      }
    },
    [],
  );

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (dragReference.current) {
        return;
      }

      const target = event.target as HTMLElement | null;

      // The grabber is portalled outside the <table>, so once the pointer is on
      // it nothing resolves to a cell. Hiding here would drop the grabber, hand
      // the pointer back to the cell, raise it again — a flicker loop that also
      // leaves no stable col-resize target to press.
      if (target?.closest("[data-table-column-resizer]")) {
        return;
      }

      const editorRoot = editor.getRootElement();
      const cell = target?.closest<HTMLTableCellElement>("td, th");
      const table = cell?.closest("table") ?? null;

      if (!editorRoot || !cell || !table || !editorRoot.contains(table)) {
        setGrabber(null);
        return;
      }

      const row = cell.parentElement;
      if (!(row instanceof HTMLTableRowElement)) {
        setGrabber(null);
        return;
      }

      // Which boundary, if any, is under the pointer. A cell's left edge is the
      // previous column's right edge; index 0 has no resizable left edge.
      let columnIndex: number | null = null;
      let boundaryX = 0;

      for (const [index, candidate] of [...row.cells].entries()) {
        const rect = candidate.getBoundingClientRect();

        if (Math.abs(event.clientX - rect.right) <= RESIZE_HIT_PX) {
          columnIndex = index;
          boundaryX = rect.right;
          break;
        }

        if (index > 0 && Math.abs(event.clientX - rect.left) <= RESIZE_HIT_PX) {
          columnIndex = index - 1;
          boundaryX = rect.left;
          break;
        }
      }

      if (columnIndex === null) {
        setGrabber(null);
        return;
      }

      // Only simple tables for now: with no merged cells a row's DOM cells map
      // one-to-one onto grid columns, which is what makes measuring the boundary
      // from the DOM sound. `$moveTableColumn` bails the same way.
      let tableKey: string | null = null;

      // `editor.read`, not `getEditorState().read`: resolving a DOM node back to
      // its Lexical node needs the ACTIVE EDITOR, not just an active state.
      editor.read(() => {
        const cellNode = $getNearestNodeFromDOMNode(cell);
        if (!cellNode) {
          return;
        }

        const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode);
        if ($isSimpleTable(tableNode)) {
          tableKey = tableNode.getKey();
        }
      });

      if (tableKey === null) {
        setGrabber(null);
        return;
      }

      const tableRect = table.getBoundingClientRect();

      setGrabber({
        table,
        tableKey,
        columnIndex,
        boundaryX,
        tableTop: tableRect.top,
        tableHeight: tableRect.height,
      });
    };

    const handleMouseLeave = (event: MouseEvent) => {
      if (dragReference.current) {
        return;
      }

      // Stepping onto the grabber leaves the contenteditable, because the
      // grabber is portalled outside it. That is not the pointer leaving the
      // table, and tearing down here is the other half of the flicker.
      const movingTo = event.relatedTarget;
      if (
        movingTo instanceof Element &&
        movingTo.closest("[data-table-column-resizer]")
      ) {
        return;
      }

      setGrabber(null);
    };

    const editorRoot = editor.getRootElement();
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    editorRoot?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      editorRoot?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [editor]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!grabber) {
      return;
    }

    // Keep Lexical from moving the selection to the cell under the grabber.
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const { table, tableKey, columnIndex } = grabber;
    const firstRow = table.rows[0];
    if (!firstRow) {
      return;
    }

    const tableRect = table.getBoundingClientRect();
    const measured = columnWidthsFromBoundaries(
      tableRect.left,
      [...firstRow.cells].map((cell) => cell.getBoundingClientRect().right),
    );

    let startWidths = measured;

    // Materialise the widths the browser is already using, so the table does not
    // jump on the first drag of a table that has never been sized.
    //
    // `discrete` so the <colgroup> exists before this handler returns. On a
    // table with no widths yet those <col> elements are created by THIS update,
    // and the first pointermove writes straight to them — flushing removes the
    // ordering question rather than relying on a render landing in between.
    editor.update(
      () => {
        const tableNode = $getNodeByKey(tableKey);
        if (!$isTableNode(tableNode) || !$isSimpleTable(tableNode)) {
          return;
        }

        startWidths = resolveColWidths(tableNode.getColWidths(), measured);
        tableNode.setColWidths(startWidths);
      },
      { discrete: true },
    );

    dragReference.current = {
      tableKey,
      columnIndex,
      startX: event.clientX,
      startWidths,
      currentWidths: startWidths,
    };
    const startRect = table.getBoundingClientRect();
    setRuler({
      x: grabber.boundaryX,
      top: startRect.top,
      height: startRect.height,
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragReference.current;
    if (!drag || !grabber) {
      return;
    }

    const next = applyResizeToColWidths(
      drag.startWidths,
      drag.columnIndex,
      event.clientX - drag.startX,
    );

    drag.currentWidths = next;
    previewWidths(grabber.table, next);

    // The boundary implied by the widths, so the clamp shows up as the line
    // stopping. Height comes from the table as it is NOW, after the preview.
    const widthDelta =
      (next[drag.columnIndex] ?? 0) - (drag.startWidths[drag.columnIndex] ?? 0);
    const tableRect = grabber.table.getBoundingClientRect();

    setRuler({
      x: grabber.boundaryX + widthDelta,
      top: tableRect.top,
      height: tableRect.height,
    });
  };

  const commitDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragReference.current;
    dragReference.current = null;
    setRuler(null);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!drag) {
      return;
    }

    // Re-anchor to where the boundary now is. `grabber.boundaryX` was captured
    // on hover, so reusing it after a resize snapped the resting mark back to
    // the column's old edge until the next pointer move corrected it.
    const movedRow = grabber?.table.rows[0];
    const movedCell = movedRow?.cells[drag.columnIndex];

    if (grabber && movedCell) {
      const cellRect = movedCell.getBoundingClientRect();
      const tableRect = grabber.table.getBoundingClientRect();

      setGrabber({
        ...grabber,
        boundaryX: cellRect.right,
        tableTop: tableRect.top,
        tableHeight: tableRect.height,
      });
    }

    // Deliberately untagged. HISTORY_MERGE_TAG would fold this into the
    // pointerdown entry — one undo instead of two — but OnChangePlugin drops
    // history-merge updates by default, so the new widths would never reach the
    // consumer's onChange and the resize would be lost on save. Correct data
    // beats saving an undo step; a drag costs two undos.
    editor.update(() => {
      const tableNode = $getNodeByKey(drag.tableKey);
      if ($isTableNode(tableNode) && $isSimpleTable(tableNode)) {
        tableNode.setColWidths(drag.currentWidths);
      }
    });
  };

  // Escape abandons the drag and puts the starting widths back.
  useEffect(() => {
    if (ruler === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const drag = dragReference.current;
      dragReference.current = null;
      setRuler(null);

      if (!drag || !grabber) {
        return;
      }

      previewWidths(grabber.table, drag.startWidths);

      // Untagged for the same reason as the commit: the restored widths have to
      // reach onChange.
      editor.update(() => {
        const tableNode = $getNodeByKey(drag.tableKey);
        if ($isTableNode(tableNode) && $isSimpleTable(tableNode)) {
          tableNode.setColWidths(drag.startWidths);
        }
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, grabber, previewWidths, ruler]);

  if (!grabber) {
    return null;
  }

  // Offsets against the portal target, which lives inside the scroll container
  // and therefore moves with the table — no scroll listener needed.
  const anchorRect = anchorElem.getBoundingClientRect();
  const isDragging = ruler !== null;

  return createPortal(
    <>
      <div
        data-table-column-resizer
        data-table-column-index={grabber.columnIndex}
        // The theme's `tableCellResizer` key positions against a cell; these
        // overlays are anchor-relative, so the geometry is inline here.
        className="absolute z-[46] flex cursor-col-resize justify-center"
        onPointerCancel={commitDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={commitDrag}
        style={{
          left: grabber.boundaryX - anchorRect.left - GRABBER_WIDTH / 2,
          top: grabber.tableTop - anchorRect.top,
          width: GRABBER_WIDTH,
          height: grabber.tableHeight,
        }}
      >
        {/*
          The grab strip is wider than the mark so it is easy to hit, but the
          mark is painted whenever the strip exists rather than on :hover — the
          strip only appears once the pointer is on the boundary, so a hover rule
          added nothing and left nothing to aim at while crossing.
        */}
        {/*
          Hidden while dragging: the ruler below tracks the pointer, and leaving
          this one painted at the original boundary showed two blue lines at
          once — read as the column splitting in two.
        */}
        {isDragging ? null : (
          <span
            aria-hidden="true"
            data-table-column-resize-mark
            className="bg-primary/60 h-full w-0.5"
          />
        )}
      </div>
      {isDragging ? (
        <div
          aria-hidden="true"
          data-table-column-resize-ruler
          className="bg-primary pointer-events-none absolute z-[47] w-px"
          style={{
            left: ruler.x - anchorRect.left,
            top: ruler.top - anchorRect.top,
            height: ruler.height,
          }}
        />
      ) : null}
    </>,
    anchorElem,
  );
}

export function TableColumnResizePlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement | null;
}): JSX.Element | null {
  if (!anchorElem) return null;
  return <TableColumnResizeInner anchorElem={anchorElem} />;
}

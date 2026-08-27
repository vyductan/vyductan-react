/**
 * The layout-free half of column resizing, kept separate from the plugin so it
 * can be tested without a browser: jsdom reports every rect as zero, so
 * anything that measures has to be a chromium play-function instead.
 */

/**
 * Floor for a column, in px, borders included.
 *
 * Matched to Notion, which lets a column shrink to about 35px. Kept in step with
 * `min-width` on both `.RichTextSemanticContract__tableCell` and
 * `…__tableCellHeader` (themes/editor-theme.css) — the header used to have no
 * floor at all, so a column's real floor depended on which row happened to be
 * widest.
 */
export const MIN_COLUMN_WIDTH = 35;

/**
 * Ceiling for a column, in px. One runaway drag should not leave a document
 * that can only be read by scrolling sideways forever.
 */
export const MAX_COLUMN_WIDTH = 1000;

/** How close the pointer must come to a column boundary to grab it, in px. */
export const RESIZE_HIT_PX = 6;

/**
 * Turn the table's own layout into an explicit width per column.
 *
 * Derived from successive right EDGES rather than from each cell's width:
 * `border-collapse: collapse` makes adjacent cells share a border, so summing
 * widths overcounts the table by one border per seam and the table would jump
 * the moment the first drag materialised those widths.
 */
export function columnWidthsFromBoundaries(
  tableLeft: number,
  cellRights: readonly number[],
): number[] {
  // Round the EDGES, then subtract. Rounding each width independently lets the
  // errors accumulate, and a 1px total drift is a visible jump on materialise.
  let previous = Math.round(tableLeft);

  return cellRights.map((right) => {
    const rounded = Math.round(right);
    const width = rounded - previous;
    previous = rounded;
    return width;
  });
}

/** Widen or narrow one column, leaving the rest of the table untouched. */
export function applyResizeToColWidths(
  startWidths: readonly number[],
  columnIndex: number,
  deltaX: number,
): number[] {
  const next = [...startWidths];
  const start = next[columnIndex];

  if (start === undefined) {
    return next;
  }

  // The floor cannot be raised above where the column already is: a column that
  // somehow starts below it must not be widened by a drag to the LEFT.
  const floor = Math.min(MIN_COLUMN_WIDTH, start);

  next[columnIndex] = Math.min(
    MAX_COLUMN_WIDTH,
    Math.max(floor, Math.round(start + deltaX)),
  );

  return next;
}

/**
 * What to treat as the starting point of a drag.
 *
 * Stored widths win when they still describe this table; otherwise the browser's
 * current layout does. A stored array of the wrong length, or carrying a
 * non-finite entry, would otherwise write NaN into the DOM.
 */
export function resolveColWidths(
  stored: readonly number[] | null | undefined,
  measured: readonly number[],
): number[] {
  const usable =
    Array.isArray(stored) &&
    stored.length === measured.length &&
    stored.every(
      (width) => typeof width === "number" && Number.isFinite(width),
    );

  return [...(usable ? stored : measured)];
}

import { describe, expect, test } from "vitest";

import {
  applyResizeToColWidths,
  columnWidthsFromBoundaries,
  MIN_COLUMN_WIDTH,
  resolveColWidths,
} from "./table-column-resize-model";

describe("columnWidthsFromBoundaries", () => {
  test("tiles exactly, so materialising widths cannot move the table", () => {
    // Successive right edges, not per-cell widths: `border-collapse: collapse`
    // shares adjacent borders, so summing widths overcounts by one border per
    // seam and the table would visibly grow on the first drag.
    const widths = columnWidthsFromBoundaries(100, [220, 340, 500]);

    expect(widths).toEqual([120, 120, 160]);
    expect(widths.reduce((total, width) => total + width, 0)).toBe(500 - 100);
  });

  test("tiles exactly for a five column table with fractional edges", () => {
    const tableLeft = 12.5;
    const rights = [112.5, 213.25, 300.75, 404, 512.5];

    const widths = columnWidthsFromBoundaries(tableLeft, rights);

    expect(widths).toHaveLength(5);
    expect(widths.reduce((total, width) => total + width, 0)).toBe(
      Math.round(512.5 - 12.5),
    );
  });
});

describe("applyResizeToColWidths", () => {
  test("moves only the dragged column", () => {
    expect(applyResizeToColWidths([120, 200, 160], 1, 40)).toEqual([
      120, 240, 160,
    ]);
  });

  test("clamps to the floor the cell CSS already enforces", () => {
    expect(applyResizeToColWidths([120, 200], 0, -500)).toEqual([
      MIN_COLUMN_WIDTH,
      200,
    ]);
  });

  test("never widens a column that already sits below the floor", () => {
    // A plain `max(MIN, next)` turned a drag to the LEFT into the column
    // growing whenever it already sat below the floor.
    const start = MIN_COLUMN_WIDTH - 4;

    expect(applyResizeToColWidths([start, 200], 0, -20)).toEqual([start, 200]);
    expect(applyResizeToColWidths([start, 200], 0, -1)).toEqual([start, 200]);
  });

  test("still lets a below-floor column grow when dragged right", () => {
    const start = MIN_COLUMN_WIDTH - 4;

    expect(applyResizeToColWidths([start, 200], 0, 30)).toEqual([
      start + 30,
      200,
    ]);
  });

  test("returns a fresh array, since colWidths is frozen in dev", () => {
    const start = Object.freeze([120, 200]) as readonly number[];

    expect(() => applyResizeToColWidths(start, 0, 10)).not.toThrow();
    expect(applyResizeToColWidths(start, 0, 10)).not.toBe(start);
  });

  test("ignores an index outside the table", () => {
    expect(applyResizeToColWidths([120, 200], 5, 40)).toEqual([120, 200]);
  });
});

describe("resolveColWidths", () => {
  const measured = [120, 200];

  test("prefers what is already stored", () => {
    expect(resolveColWidths([300, 400], measured)).toEqual([300, 400]);
  });

  test("falls back to the measurement when nothing is stored", () => {
    expect(resolveColWidths(undefined, measured)).toEqual(measured);
    expect(resolveColWidths(null, measured)).toEqual(measured);
  });

  test("falls back when the stored array no longer matches the table", () => {
    expect(resolveColWidths([300], measured)).toEqual(measured);
    expect(resolveColWidths([300, 400, 500], measured)).toEqual(measured);
  });

  test("falls back on a non-finite entry rather than writing NaN widths", () => {
    expect(resolveColWidths([300, Number.NaN], measured)).toEqual(measured);
    expect(resolveColWidths([300, Number.POSITIVE_INFINITY], measured)).toEqual(
      measured,
    );
  });
});

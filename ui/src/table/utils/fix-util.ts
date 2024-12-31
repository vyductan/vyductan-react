import type { Direction } from "../../types";
import type { FixedType, StickyOffsets } from "../types";

export interface FixedInfo {
  fixLeft: number | false;
  fixRight: number | false;
  lastFixLeft: boolean;
  firstFixRight: boolean;

  lastFixRight: boolean;
  firstFixLeft: boolean;

  isSticky: boolean;
}

export function getCellFixedInfo(
  colStart: number,
  colEnd: number,
  columns: readonly { fixed?: FixedType }[],
  stickyOffsets: StickyOffsets,
  direction: Direction,
): FixedInfo {
  console.log("aaaaaa", columns);
  const startColumn = columns[colStart] ?? {};
  const endColumn = columns[colEnd] ?? {};

  let fixLeft: number | undefined;
  let fixRight: number | undefined;

  if (startColumn.fixed === "left") {
    fixLeft = stickyOffsets.left[direction === "rtl" ? colEnd : colStart];
  } else if (endColumn.fixed === "right") {
    fixRight = stickyOffsets.right[direction === "rtl" ? colStart : colEnd];
  }

  let lastFixLeft = false;
  let firstFixRight = false;

  let lastFixRight = false;
  let firstFixLeft = false;

  const nextColumn = columns[colEnd + 1];
  const prevColumn = columns[colStart - 1];

  // need show shadow only when canLastFix is true
  const canLastFix =
    (nextColumn && !nextColumn.fixed) ??
    (prevColumn && !prevColumn.fixed) ??
    columns.every((col) => col.fixed === "left");

  if (direction === "rtl") {
    if (fixLeft !== undefined) {
      const prevFixLeft = prevColumn && prevColumn.fixed === "left";
      firstFixLeft = !prevFixLeft && canLastFix;
    } else if (fixRight !== undefined) {
      const nextFixRight = nextColumn && nextColumn.fixed === "right";
      lastFixRight = !nextFixRight && canLastFix;
    }
  } else if (fixLeft !== undefined) {
    const nextFixLeft = nextColumn && nextColumn.fixed === "left";
    lastFixLeft = !nextFixLeft && canLastFix;
  } else if (fixRight !== undefined) {
    const prevFixRight = prevColumn && prevColumn.fixed === "right";
    firstFixRight = !prevFixRight && canLastFix;
  }

  return {
    fixLeft: fixLeft ?? false,
    fixRight: fixRight ?? false,
    lastFixLeft,
    firstFixRight,
    lastFixRight,
    firstFixLeft,
    isSticky: stickyOffsets.isSticky ?? false,
  };
}

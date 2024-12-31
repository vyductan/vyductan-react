import type { Column } from "@tanstack/react-table";
import type { CSSProperties } from "react";

import { cn } from "..";

// export const tableStyles = {
//   row: {
//     classNames: cn("bg-background"),
//     hoverClassNames: cn("bg-gray-100 dark:bg-gray-800"),
//     hoverByCssClassNames: "hover:bg-gray-100 dark:hover:bg-gray-800",
//   },
// };

//These are the important styles to make sticky column pinning work!
//Apply styles like this using your CSS strategy of choice with this kind of logic to head cells, data cells, footer cells, etc.
//View the index.css file for more needed styles such as border-collapse: separate
export const getCommonPinningStyles = <T>(column: Column<T>): CSSProperties => {
  const isPinned = column.getIsPinned();
  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
  };
};
export const getCommonPinningClassName = <T>(
  column: Column<T>,
  { scrollLeft, scrollRight }: { scrollLeft: number; scrollRight: number },
  _isHeader?: boolean,
): string => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");
  return cn(
    // isPinned && !isHeader && "bg-surface",
    isPinned ? "sticky z-10" : "relative",
    isLastLeftPinnedColumn && [
      "after:absolute after:inset-y-0 after:right-0 after:w-[30px] after:translate-x-full",
      scrollLeft !== 0 &&
        "after:shadow-[inset_10px_0_8px_-8px_rgba(5,5,5,.06)]",
    ],

    isFirstRightPinnedColumn && [
      "after:absolute after:inset-y-0 after:left-0 after:w-[30px] after:-translate-x-full",
      scrollRight > 0 &&
        "after:shadow-[inset_-10px_0_8px_-8px_rgba(5,5,5,.06)]",
    ],
  );
};

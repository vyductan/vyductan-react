import { forwardRef } from "react";

import type { TableSize } from "./types";
import { clsm } from "..";

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  size?: TableSize;
};
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, size, ...props }, ref) => (
    <td
      ref={ref}
      className={clsm(
        "px-3",
        size === "sm" ? "py-2" : "py-3",
        "border-b",
        "break-words",
        // "group-hover:bg-background-hover",
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

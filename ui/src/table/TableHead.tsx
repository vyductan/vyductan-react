import React from "react";

import type { TableSize } from "./types";
import { clsm } from "..";

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  size?: TableSize;
};
export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, size, ...props }, ref) => (
    <th
      ref={ref}
      className={clsm(
        "px-2",
        size === "sm" ? "py-2" : "py-3",
        "text-left",
        "break-words font-medium text-foreground",
        "first:rounded-tl-md last:rounded-tr-md",

        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

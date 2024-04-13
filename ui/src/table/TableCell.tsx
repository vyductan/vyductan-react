import { forwardRef } from "react";

import { clsm } from "..";

export const TableCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={clsm(
      "p-3",
      "border-b",
      "break-words",
      "group-hover:bg-background-hover",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

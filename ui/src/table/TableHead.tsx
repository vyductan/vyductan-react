import React from "react";

import { clsm } from "@acme/ui";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={clsm(
      "p-3 text-left",
      "break-words font-medium text-foreground",
      "first:rounded-tl-md last:rounded-tr-md",

      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

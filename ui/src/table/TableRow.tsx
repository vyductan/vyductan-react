import { forwardRef } from "react";

import { clsm } from "..";

export const TableRow = forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={clsm(
      "group",
      "transition-colors",
      "data-[state=selected]:bg-gray-100 dark:data-[state=selected]:bg-gray-800",
      "hover:bg-gray-100",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

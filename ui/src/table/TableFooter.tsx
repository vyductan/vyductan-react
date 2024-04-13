import { forwardRef } from "react";

import { clsm } from "@acme/ui";

const TableFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={clsm(
      "bg-gray-900 font-medium text-gray-50 dark:bg-gray-50 dark:text-gray-900",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

import { forwardRef } from "react";

import { clsm } from "..";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={clsm("[&_tr]:border-b", "bg-gray-100", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

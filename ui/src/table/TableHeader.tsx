import { forwardRef } from "react";

import { clsm } from "@acme/ui";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={clsm("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

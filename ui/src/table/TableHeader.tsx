import { forwardRef } from "react";

import { clsm } from "@vyductan/utils";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={clsm("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

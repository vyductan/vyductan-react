import type { VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@acme/ui/lib/utils";

import type { Alert as ShadcnAlert } from "@acme/ui/shadcn/alert";

export const alertVariants = cva(
  [
    "relative w-full rounded-lg border leading-line-height px-3 py-2 text-sm   has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
    // "grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr]",
    "flex",
  ],

  {
    variants: {
      type: {
        // default: "bg-card text-card-foreground",
        // destructive:
        // "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        info: "border-blue-300 bg-blue-100 text-blue-600",
        success: "border-green-300 bg-green-100 text-green-600",
        warning: "border-amber-300 bg-amber-100 text-amber-600",
        error: "border-red-300 bg-red-100 text-red-600",
      },
      bordered: {
        false: "border-transparent",
      },
    },
    defaultVariants: {
      type: "info",
    },
  },
);
type AlertType = VariantProps<typeof alertVariants>["type"];

function AlertContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-content"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  );
}
type ShadcnAlertProps = React.ComponentProps<typeof ShadcnAlert>;

export { AlertContent };
export type { AlertType, ShadcnAlertProps };
export {
  AlertTitle,
  AlertDescription,
  Alert as ShadcnAlert,
} from "@acme/ui/shadcn/alert";

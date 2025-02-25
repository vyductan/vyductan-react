import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "..";

export const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      type: {
        default: "bg-background text-foreground",
        // destructive:
        // "text-destructive-foreground [&>svg]:text-current *:data-[slot=alert-description]:text-destructive-foreground/80",
        error: "border-red-300 bg-red-100 text-red-600",
        info: "border-blue-300 bg-blue-100 text-blue-600",
        warning: "border-amber-300 bg-amber-100 text-amber-600",
      },
      bordered: {
        false: "border-transparent",
      },
    },
    defaultVariants: {
      type: "default",
    },
  },
);

type AlertRootProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants>;
function AlertRoot({
  className,
  type,
  bordered,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ type, bordered }), "space-y-1", className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export type { AlertRootProps };
export { AlertRoot, AlertTitle, AlertDescription };

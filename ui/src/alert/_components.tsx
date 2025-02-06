import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "..";

export const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-md border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      type: {
        default: "bg-background text-foreground",
        // error:
        //   "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        error: "border-red-300 bg-red-100 text-red-800",
        info: "border-blue-300 bg-blue-100 text-blue-800",
        warning:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
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
const AlertRoot = ({ className, type, bordered, ...props }: AlertRootProps) => {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ type, bordered }), "space-y-1", className)}
      {...props}
    />
  );
};

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
        "col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export type { AlertRootProps };
export { AlertRoot, AlertTitle, AlertDescription };

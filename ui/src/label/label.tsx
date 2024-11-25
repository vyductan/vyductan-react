"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";

import { cn } from "..";

const labelVariants = cva([
  "text-sm font-medium",
  "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
]);

type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants> & {
    required?: boolean;
    as?: React.ElementType;
  };
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, children, required, as, ...props }, ref) => {
  const Comp = as ?? "label";
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), className)}
      asChild
      {...props}
    >
      <Comp>
        {children}
        {required && <span className="text-red-600"> *</span>}
      </Comp>
    </LabelPrimitive.Root>
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

export type { LabelProps };
export { Label };

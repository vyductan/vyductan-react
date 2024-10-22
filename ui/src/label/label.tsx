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
  };
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, children, required, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  >
    {children}
    {required && <span className="text-red-600"> *</span>}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;

export type { LabelProps };
export { Label };

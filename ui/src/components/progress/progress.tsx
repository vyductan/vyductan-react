"use client";

import type { VariantProps } from "tailwind-variants";
import * as React from "react";
import { tv } from "tailwind-variants";

import type { ProgressProps as ShadcnProgressProps } from "@acme/ui/shadcn/progress";
import { cn } from "@acme/ui/lib/utils";
import { Progress as ShadcnProgress } from "@acme/ui/shadcn/progress";

import { AnimatedCircularProgressBar } from "./circle";

const progressVariants = tv({
  base: "",
  variants: {
    status: {
      default: "*:data-[slot=progress-indicator]:bg-blue-500",
      success: "*:data-[slot=progress-indicator]:bg-green-500",
      warning: "*:data-[slot=progress-indicator]:bg-yellow-500",
      danger: "*:data-[slot=progress-indicator]:bg-red-500",
    },
  },
  defaultVariants: {
    status: "default",
  },
});
type ProgressProps = Pick<
  ShadcnProgressProps,
  "value" | "className" | "indicatorClassName"
> &
  VariantProps<typeof progressVariants> & {
    percent?: number;
    type?: "circle";
    size?: number;
  };
function Progress({
  className,
  percent,
  type,
  size,
  status,
  ...props
}: ProgressProps) {
  if (type === "circle") {
    return (
      <AnimatedCircularProgressBar
        max={100}
        min={0}
        value={percent ?? 0}
        //   gaugePrimaryColor="rgb(79 70 229)"
        //   gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
        size={size}
        className={cn(
          "**:data-[slot=circle-percent]:stroke-blue-500",
          percent === 100 && "**:data-[slot=circle-percent]:stroke-green-500",
          className,
        )}
      />
    );
  }
  return (
    <ShadcnProgress
      className={cn(progressVariants({ status }), "bg-accent", className)}
      value={percent}
      {...props}
    />
  );
}

export { Progress };

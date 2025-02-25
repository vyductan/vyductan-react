"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "..";
import { AnimatedCircularProgressBar } from "./circle";

type ProgressProps = Omit<
  React.ComponentProps<typeof ProgressPrimitive.Root>,
  "value"
> & {
  percent?: number;
  type?: "circle";
  size?: number;
};
function Progress({ className, percent, type, size, ...props }: ProgressProps) {
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
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all",
          // "bg-primary",
          "bg-blue-500",
        )}
        style={{ transform: `translateX(-${100 - (percent ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { clsm } from "@vyductan/utils";

import type { ScrollBarProps } from "./ScrollBar";
import { ScrollBar } from "./ScrollBar";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    orientation?: ScrollBarProps["orientation"];
    viewportRef?: React.RefObject<HTMLDivElement>;
  }
>(({ className, children, orientation, viewportRef, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={clsm("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport
      ref={viewportRef}
      className="h-full w-full rounded-[inherit]"
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar
      // ref={ref}
      orientation={orientation}
    />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export { ScrollArea, ScrollBar };

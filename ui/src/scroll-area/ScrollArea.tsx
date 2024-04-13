"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { clsm } from "@acme/ui";

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
    className={clsm("overflow-hidden", className)}
  >
    <ScrollAreaPrimitive.Viewport
      ref={viewportRef}
      className="size-full rounded-[inherit]"
      {...props}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar orientation={orientation} />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export { ScrollArea, ScrollBar };

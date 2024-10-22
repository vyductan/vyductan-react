"use client";

import type { TooltipContentProps } from "@radix-ui/react-tooltip";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { clsm } from "..";

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={clsm(
      "z-50 overflow-hidden rounded-md bg-gray-950 px-3 py-1 text-sm text-gray-100 shadow-md",
      "data-[side=top]:slide-in-from-bottom-2",
      "data-[side=right]:slide-in-from-left-2",
      "data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const TooltipArrow = () => {
  return <TooltipPrimitive.Arrow className="" />;
};

type TooltipProps = Omit<TooltipPrimitive.TooltipProps, "side"> & {
  /**
   * The text shown in the tooltip
   */
  title: React.ReactNode;
  placement?: TooltipContentProps["side"];
};
const Tooltip = ({ children, title, placement, ...rest }: TooltipProps) => {
  const triggerRef = React.useRef(null);

  return (
    <TooltipProvider delayDuration={100}>
      <TooltipPrimitive.Root {...rest}>
        <TooltipTrigger
          ref={triggerRef}
          asChild
          // keep tooltip open when trigger is clicked
          onClick={(event) => event.preventDefault()}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={placement}
          // keep tooltip open when trigger is clicked
          onPointerDownOutside={(event) => {
            if (event.target === triggerRef.current) event.preventDefault();
          }}
        >
          {title}
          <TooltipArrow />
        </TooltipContent>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  );
};

export { Tooltip };
export type { TooltipProps };

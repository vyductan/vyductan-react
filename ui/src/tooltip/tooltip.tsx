"use client";

import type {
  TooltipProps as RduTooltipProps,
  TooltipContentProps,
} from "@radix-ui/react-tooltip";
import * as React from "react";

import {
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "./_components";

type TooltipProps = Omit<RduTooltipProps, "side"> & {
  /**
   * The text shown in the tooltip
   */
  title: React.ReactNode;
  placement?: TooltipContentProps["side"];
  hidden?: boolean;
};
const Tooltip = ({
  children,
  title,
  placement,
  hidden,
  ...rest
}: TooltipProps) => {
  const triggerRef = React.useRef(null);

  return (
    <>
      <TooltipProvider delayDuration={100}>
        <TooltipRoot {...rest}>
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
            hidden={hidden}
            // keep tooltip open when trigger is clicked
            onPointerDownOutside={(event) => {
              if (event.target === triggerRef.current) event.preventDefault();
            }}
          >
            {title}
            <TooltipArrow />
          </TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    </>
  );
};

export { Tooltip };
export type { TooltipProps };

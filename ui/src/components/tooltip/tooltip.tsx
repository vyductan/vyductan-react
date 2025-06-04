"use client";

import type {
  TooltipProps as RduTooltipProps,
  TooltipContentProps,
} from "@radix-ui/react-tooltip";
import * as React from "react";

import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "./_components";

type TooltipProps = Omit<RduTooltipProps, "side"> & {
  /**
   * The text shown in the tooltip
   */
  title?: React.ReactNode;
  placement?: TooltipContentProps["side"];
  hidden?: boolean;
  classNames?: {
    title?: string;
    arrow?: string;
  };
};
const Tooltip = (props: TooltipProps) => {
  const { children, title, placement, hidden, classNames, ...restProps } =
    props;
  const triggerRef = React.useRef(null);

  const isShadcnTooltip = !title;
  if (isShadcnTooltip) return <TooltipRoot {...props} />;

  return (
    <>
      <TooltipProvider delayDuration={100}>
        <TooltipRoot {...restProps}>
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
            className={classNames?.title}
            classNames={{
              arrow: classNames?.arrow,
            }}
          >
            {title}
          </TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    </>
  );
};

export { Tooltip };
export type { TooltipProps };

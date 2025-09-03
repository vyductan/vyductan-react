"use client";

import type { TooltipProps as RduTooltipProps } from "@radix-ui/react-tooltip";
import * as React from "react";

import type { AlignType } from "../../types";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "./_components";

export type TooltipPlacement =
  | "top"
  | "left"
  | "right"
  | "bottom"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "leftTop"
  | "leftBottom"
  | "rightTop"
  | "rightBottom";

type TooltipProps = Omit<RduTooltipProps, "side"> & {
  /**
   * The text shown in the tooltip
   */
  title?: React.ReactNode;
  placement?: TooltipPlacement;
  hidden?: boolean;
  classNames?: {
    title?: string;
    arrow?: string;
  };
  align?: AlignType;
};
const Tooltip = (props: TooltipProps) => {
  const triggerRef = React.useRef(null);

  const isShadcnTooltip = !props.title;
  if (isShadcnTooltip) return <TooltipRoot {...props} />;

  const {
    children,
    title,
    placement,
    hidden,
    classNames,
    align: domAlign,
    ...restProps
  } = props;

  const side = placement?.includes("top")
    ? "top"
    : placement?.includes("right")
      ? "right"
      : !placement || placement.includes("bottom")
        ? "bottom"
        : "left";
  const align = placement?.includes("Top")
    ? "start"
    : !placement ||
        (!placement.includes("Left") && !placement.includes("Right"))
      ? "center"
      : placement.includes("Left")
        ? "start"
        : "end";

  const alignOffset = domAlign?.offset?.[0];
  const sideOffset = domAlign?.offset?.[1];

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
            side={side}
            align={align}
            alignOffset={alignOffset}
            sideOffset={sideOffset}
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

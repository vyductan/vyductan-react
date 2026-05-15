"use client";

import * as React from "react";
import type { Tooltip as TooltipPrimitive } from "radix-ui";

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
export type AbstractTooltipProps = {
  placement?: TooltipPlacement;
};

type TooltipProps = AbstractTooltipProps &
  Omit<React.ComponentProps<typeof TooltipPrimitive.Root>, "side"> & {
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
    styles?: {
      title?: React.CSSProperties;
      arrow?: React.CSSProperties;
    };
    align?: AlignType;
  };
const Tooltip = (props: TooltipProps) => {
  const triggerRef = React.useRef(null);

  const isShadcnTooltip = !("title" in props);
  if (isShadcnTooltip) return <TooltipRoot {...props} />;

  if (!props.title) {
    return <>{props.children}</>;
  }

  const {
    children,
    title,
    placement,
    hidden,
    classNames,
    styles,
    align: domAlign,
    ...restProps
  } = props;

  let side: "top" | "right" | "bottom" | "left" = "bottom";
  if (placement?.includes("top")) {
    side = "top";
  } else if (placement?.includes("right")) {
    side = "right";
  } else if (placement?.includes("left")) {
    side = "left";
  }

  let align: "start" | "center" | "end" = "center";
  if (placement?.includes("Top")) {
    align = "start";
  } else if (placement?.includes("Left")) {
    align = "start";
  } else if (placement?.includes("Right")) {
    align = "end";
  }

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
            style={styles?.title}
            classNames={
              classNames?.arrow ? { arrow: classNames.arrow } : undefined
            }
            styles={styles?.arrow ? { arrow: styles.arrow } : undefined}
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

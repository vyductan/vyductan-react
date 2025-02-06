import React from "react";
import { PopoverArrow } from "@radix-ui/react-popover";

import type { AlignType, Placement } from "../types";
import type { PopoverContentProps, PopoverRootProps } from "./_components";
import { cn } from "..";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "./_components";

export type PopoverProps = PopoverRootProps &
  Omit<PopoverContentProps, "content" | "sideOffset" | "align"> & {
    trigger?: "click" | "hover" | "focus";
    content?: React.ReactNode;

    align?: AlignType;
    placement?: Placement;

    arrow?: boolean;
  };
export const Popover = ({
  children,
  trigger = "hover",
  content,
  open,

  align: domAlign,
  placement,
  className,
  arrow,
  onOpenChange,
  ...props
}: PopoverProps) => {
  const side = placement?.includes("top")
    ? "top"
    : placement?.includes("right")
      ? "right"
      : !placement || placement.includes("bottom")
        ? "bottom"
        : "left";
  const align =
    !placement || (!placement.includes("Left") && !placement.includes("Right"))
      ? "center"
      : placement.includes("Left")
        ? "start"
        : "end";

  const alignOffset = domAlign?.offset?.[0];
  const sideOffset = domAlign?.offset?.[1];

  return (
    <PopoverRoot open={open} onOpenChange={onOpenChange}>
      {open === undefined ? (
        <PopoverTrigger asChild>{children}</PopoverTrigger>
      ) : (
        <PopoverTrigger
          asChild
          {...(trigger === "hover"
            ? {
                onMouseOver: () => {
                  if (!open) onOpenChange?.(true);
                },
                onMouseLeave: () => {
                  if (open) onOpenChange?.(false);
                },
              }
            : {})}
        >
          {children}
        </PopoverTrigger>
      )}
      {/* {open === undefined ? ( */}
      {/*   <PopoverTrigger asChild>{children}</PopoverTrigger> */}
      {/* ) : ( */}
      {/*   <PopoverAnchor */}
      {/*     asChild */}
      {/*     {...(trigger === "hover" */}
      {/*       ? { */}
      {/*           onMouseOver: () => { */}
      {/*             if (!open) onOpenChange?.(true); */}
      {/*           }, */}
      {/*           onMouseLeave: () => { */}
      {/*             if (open) onOpenChange?.(false); */}
      {/*           }, */}
      {/*         } */}
      {/*       : {})} */}
      {/*   > */}
      {/*     {children} */}
      {/*   </PopoverAnchor> */}
      {/* )} */}
      <PopoverContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(arrow ? "border-none" : "", className)}
        {...props}
      >
        {arrow && <PopoverArrow className="fill-white" />}
        {content}
      </PopoverContent>
    </PopoverRoot>
  );
};

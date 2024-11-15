import React from "react";
import { PopoverArrow } from "@radix-ui/react-popover";

import type { Placement } from "../types";
import type { PopoverContentProps, PopoverRootProps } from "./_components";
import { cn } from "..";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "./_components";

export type PopoverProps = PopoverRootProps &
  Omit<PopoverContentProps, "content"> & {
    trigger?: "click" | "hover" | "focus";
    content?: React.ReactNode;
    placement?: Placement;
    arrow?: boolean;
  };
export const Popover = ({
  children,
  trigger = "hover",
  content,
  open,

  className,
  placement,
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
        align={align}
        className={cn(arrow ? "border-none" : "", className)}
        {...props}
      >
        {arrow && <PopoverArrow className="fill-white" />}
        {content}
      </PopoverContent>
    </PopoverRoot>
  );
};

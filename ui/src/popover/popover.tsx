import React from "react";

import type { Placement } from "../types";
import type { PopoverContentProps, PopoverRootProps } from "./_components";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "./_components";

export type PopoverProps = PopoverRootProps &
  Omit<PopoverContentProps, "content"> & {
    trigger?: "click" | "hover" | "focus";
    content?: React.ReactNode;
    placement?: Placement;
  };
export const Popover = ({
  children,
  trigger = "hover",
  content,
  open,
  placement,
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
    !placement || placement.includes("auto")
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
      <PopoverContent side={side} align={align} {...props}>
        {content}
      </PopoverContent>
    </PopoverRoot>
  );
};

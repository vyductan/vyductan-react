import React from "react";
import { PopoverArrow } from "@radix-ui/react-popover";
import { useMergedState } from "@rc-component/util";
import { useDebounce } from "ahooks";

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
  open: openProp,

  align: domAlign,
  placement,
  className,
  arrow = true,
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

  const [open, setOpen] = useMergedState(false, {
    value: openProp,
    onChange: (value) => onOpenChange?.(value),
  });
  const debouncedOpen = useDebounce(open, {
    wait: 100,
  });
  return (
    <PopoverRoot open={debouncedOpen} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        {...(trigger === "hover"
          ? {
              onMouseOver: () => {
                if (!open) setOpen(true);
              },
              onMouseLeave: () => {
                if (open) setOpen(false);
              },
            }
          : {})}
      >
        {children}
      </PopoverTrigger>

      <PopoverContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(arrow ? "border-none" : "", className)}
        {...(trigger === "hover"
          ? {
              onMouseOver: () => {
                if (!open) setOpen(true);
              },
              onMouseLeave: () => {
                if (open) setOpen(false);
              },
            }
          : {})}
        {...props}
      >
        {arrow && <PopoverArrow className="fill-white" />}
        {content}
      </PopoverContent>
    </PopoverRoot>
  );
};

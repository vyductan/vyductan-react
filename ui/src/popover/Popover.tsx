import React from "react";

import type { PopoverContentProps, PopoverRootProps } from "./_components";
import {
  PopoverAnchor,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "./_components";

export type PopoverProps = PopoverRootProps &
  Omit<PopoverContentProps, "content"> & {
    trigger?: "click" | "hover" | "focus";
    content?: React.ReactNode;
  };
export const Popover = ({
  children,
  trigger = "hover",
  content,
  open,
  onOpenChange,
  ...props
}: PopoverProps) => {
  return (
    <PopoverRoot open={open} onOpenChange={onOpenChange}>
      {open !== undefined ? (
        <PopoverAnchor
          asChild
          {...(trigger === "hover"
            ? {
                onMouseOver: () => {
                  console.log("over");
                  if (!open) onOpenChange?.(true);
                },
                onMouseLeave: () => {
                  console.log("leave");
                  if (open) onOpenChange?.(false);
                },
              }
            : {})}
        >
          {children}
        </PopoverAnchor>
      ) : (
        <PopoverTrigger asChild>{children}</PopoverTrigger>
      )}
      <PopoverContent {...props}>{content}</PopoverContent>
    </PopoverRoot>
  );
};

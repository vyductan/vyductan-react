import React from "react";

import type { PopoverContentProps, PopoverRootProps } from "./components";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "./components";

export type PopoverProps = PopoverRootProps &
  PopoverContentProps & {
    trigger?: React.ReactNode;
  };
export const Popover = ({
  children,
  trigger,
  open,
  onOpenChange,
  ...props
}: PopoverProps) => {
  return (
    <PopoverRoot open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent {...props}>{children}</PopoverContent>
    </PopoverRoot>
  );
};

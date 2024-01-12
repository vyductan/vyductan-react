import React from "react";

import { PopoverContent, PopoverRoot, PopoverTrigger } from "./components";

type PopoverProps = {
  className?: string;
  content: React.ReactNode;
  children?: React.ReactNode;
};
export const Popover = ({ className, content, children }: PopoverProps) => {
  return (
    <PopoverRoot>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className={className}>{content}</PopoverContent>
    </PopoverRoot>
  );
};

import type * as React from "react";

import { cn } from "@acme/ui/lib/utils";

import type { TagProps } from "./tag";
import { Tag } from "./tag";

export interface CheckableTagProps
  extends Omit<TagProps, "checked" | "onClose" | "closeIcon" | "onChange"> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const CheckableTag = ({
  checked = false,
  onChange,
  className,
  onClick,
  ...props
}: CheckableTagProps) => {
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    onChange?.(!checked);
    onClick?.(e);
  };

  return (
    <Tag
      className={cn(
        "cursor-pointer transition-all duration-200",
        checked
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-muted text-muted-foreground border-border hover:bg-muted/80",
        className,
      )}
      onClick={handleClick}
      {...props}
    />
  );
};

export { CheckableTag };

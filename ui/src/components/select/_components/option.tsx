import React from "react";
import { cn } from "@acme/ui/lib/utils";

import type { SelectValueType } from "../types";
import { SelectItem } from "@acme/ui/shadcn/select";
import { SelectContext } from "../context";

type OptionProps = {
  value: SelectValueType;
  children?: React.ReactNode;
  className?: string;
};

const Option: React.FC<OptionProps> = ({ value, children, className }) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  const isActive = ctx.selectedValues.includes(value);
  return (
    <SelectItem
      value={value as string}
      className={cn(
        isActive
          ? "bg-primary-100 focus:bg-primary-100 hover:bg-primary-100 [&>span>span[role='img']]:text-primary-600"
          : "",
        className,
      )}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        ctx.triggerChange(value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          ctx.triggerChange(value);
        }
      }}
      isActive={isActive}
    >
      {children}
    </SelectItem>
  );
};

export { Option };

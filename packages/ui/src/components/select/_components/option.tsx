import React from "react";

import { cn } from "@acme/ui/lib/utils";
import { SelectItem } from "@acme/ui/shadcn/select";

import type { SelectValueType } from "../types";
import { SelectContext } from "../context";

type OptionProperties = {
  value: SelectValueType;
  children?: React.ReactNode;
  className?: string;
};

const Option: React.FC<OptionProperties> = ({ value, children, className }) => {
  const context = React.useContext(SelectContext);
  if (!context) return;
  const isActive = context.selectedValues.includes(value);
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
        context.triggerChange(value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          context.triggerChange(value);
        }
      }}
    >
      {children}
    </SelectItem>
  );
};

export { Option };

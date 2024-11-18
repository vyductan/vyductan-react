import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import type { ValueType } from "../form";
import { cn } from "..";
import { Icon } from "../icons";
import { radioColors } from "./colors";

type RadioProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  "value"
> & {
  label?: React.ReactNode;
  value?: ValueType;
  color?: string;
};
const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(({ value, label, disabled, className, color = "default", ...props }, ref) => {
  return (
    <label
      className={cn(
        "flex items-center",
        "cursor-pointer text-sm",
        radioColors[color],
        disabled &&
          "cursor-not-allowed text-foreground opacity-30 [&>button]:border-foreground",
        className,
      )}
    >
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value as string}
        className={cn(
          "aspect-square size-4 rounded-full border shadow ring-offset-background",
          "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:border-2",
        )}
        disabled={disabled}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Icon
            icon="icon-[bi--circle-fill]"
            className="size-2 fill-current text-current"
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <span className="px-2">{label}</span>
    </label>
  );
});
Radio.displayName = RadioGroupPrimitive.Item.displayName;

export { Radio };

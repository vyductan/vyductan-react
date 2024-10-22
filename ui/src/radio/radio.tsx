import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import type { ValueType } from "../form";
import { clsm } from "..";
import { Icon } from "../icons";

type RadioProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  "value"
> & {
  label?: React.ReactNode;
  value?: ValueType;
};
const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(({ label, className, value, ...props }, ref) => {
  return (
    <label className={clsm("flex items-center", "text-sm", className)}>
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value as string}
        className={clsm(
          "aspect-square size-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:border-2",
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Icon
            icon="icon-[bi--circle-fill]"
            className="size-2 fill-current text-current"
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <span className="cursor-pointer px-2">{label}</span>
    </label>
  );
});
Radio.displayName = RadioGroupPrimitive.Item.displayName;

export { Radio };

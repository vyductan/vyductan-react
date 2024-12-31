import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import type { ValueType } from "../form";
import { cn } from "..";
import { Icon } from "../icons";
import { Label } from "../label";
import {
  radioButtonSolidActiveColors,
  radioButtonSolidColors,
  radioColors,
} from "./colors";

type RadioProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  "value"
> & {
  label?: React.ReactNode;
  value?: ValueType;
  color?: string;
  optionType?: "button";
  buttonStyle?: "solid";
  isActive?: boolean;
  preColor?: string;
};
const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(
  (
    {
      value,
      label,
      disabled,
      className,
      color = "default",
      optionType,
      buttonStyle,
      isActive,
      preColor,
      ...props
    },
    ref,
  ) => {
    if (optionType === "button" && buttonStyle) {
      return (
        <label
          className={cn(
            "inline-flex cursor-pointer items-center justify-center whitespace-nowrap px-3 py-[5px] text-sm font-medium ring-offset-background transition-all",
            "border border-l-0 first:rounded-s-md first:border-l last:rounded-e-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            radioColors[color],
            disabled && "pointer-events-none cursor-not-allowed opacity-50",
            radioButtonSolidColors[color],
            preColor && radioButtonSolidColors[preColor]?.split(" ")[1],
            isActive &&
              radioButtonSolidActiveColors[color] +
                " shadow-sm [&>button]:text-white",
            className,
          )}
        >
          <RadioGroupPrimitive.Item
            ref={ref}
            value={value as string}
            disabled={disabled}
            {...props}
          >
            <Label as="span">
              <span>{label}</span>
            </Label>
          </RadioGroupPrimitive.Item>
          {/* <Label htmlFor={value as string}>{label}</Label> */}
        </label>
      );
    }

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
  },
);
Radio.displayName = RadioGroupPrimitive.Item.displayName;

export type { RadioProps };
export { Radio };

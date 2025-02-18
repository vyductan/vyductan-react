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
  React.ComponentProps<typeof RadioGroupPrimitive.Item>,
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
const Radio = ({
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
}: RadioProps) => {
  if (optionType === "button" && buttonStyle) {
    return (
      <label
        className={cn(
          "ring-offset-background inline-flex cursor-pointer items-center justify-center px-3 py-[5px] text-sm font-medium whitespace-nowrap transition-all",
          "border border-l-0 first:rounded-s-md first:border-l last:rounded-e-md",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden",
          radioColors[color],
          disabled && "pointer-events-none cursor-not-allowed opacity-50",
          radioButtonSolidColors[color],
          preColor && radioButtonSolidColors[preColor]?.split(" ")[1],
          isActive &&
            radioButtonSolidActiveColors[color] +
              " shadow-xs [&>button]:text-white",
          className,
        )}
      >
        <RadioGroupPrimitive.Item
          value={value as string}
          disabled={disabled}
          {...props}
        >
          <Label asChild>
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
          "text-foreground [&>button]:border-foreground cursor-not-allowed opacity-30",
        className,
      )}
    >
      <RadioGroupPrimitive.Item
        data-slot="radio-group-item"
        value={value as string}
        className={cn(
          "border-input text-primary aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow]",
          "ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50",
          "focus-visible:ring-4 focus-visible:outline-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:focus-visible:ring-0",

          // old
          // "ring-offset-background aspect-square size-4 rounded-full border shadow-sm",
          // "focus-visible:ring-ring focus:outline-hidden focus-visible:ring-1",
          // "disabled:cursor-not-allowed disabled:opacity-50",
          // "data-[state=checked]:border-2",
        )}
        disabled={disabled}
        {...props}
      >
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="relative flex items-center justify-center"
        >
          <Icon
            icon="icon-[bi--circle-fill]"
            className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2"
            // className="size-2 fill-current text-current"
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <span className="px-2">{label}</span>
    </label>
  );
};

export type { RadioProps };
export { Radio };

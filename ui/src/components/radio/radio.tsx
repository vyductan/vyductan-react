import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@acme/ui/lib/utils";

import type { AbstractCheckboxProps } from "../checkbox";
import type { RadioChangeEvent } from "./types";
import { Icon } from "../../icons";
import { Label } from "../label";
import {
  radioButtonSolidActiveColors,
  radioButtonSolidColors,
  radioColors,
} from "./colors";

type RadioProps = AbstractCheckboxProps<RadioChangeEvent> & {
  label?: React.ReactNode;
  value?: any;
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
  onChange,
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
          value={value}
          disabled={disabled}
          {...props}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (disabled) return;
            const event = {
              target: {
                ...props,
                value,
                label,
                disabled,
                color,
                optionType,
                buttonStyle,
                isActive,
                preColor,
                checked: true,
              },
              stopPropagation: () => e.stopPropagation(),
              preventDefault: () => e.preventDefault(),
              nativeEvent: e.nativeEvent,
            };
            onChange?.(event);
            props.onClick?.(e);
          }}
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
        value={value}
        className={cn(
          "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        )}
        disabled={disabled}
        {...props}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (disabled) return;
          const event = {
            target: {
              ...props,
              value,
              label,
              disabled,
              color,
              optionType,
              buttonStyle,
              isActive,
              preColor,
              checked: true,
            },
            stopPropagation: () => e.stopPropagation(),
            preventDefault: () => e.preventDefault(),
            nativeEvent: e.nativeEvent,
          };
          onChange?.(event);
          props.onClick?.(e);
        }}
      >
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="relative flex items-center justify-center"
        >
          <Icon
            icon="icon-[bi--circle-fill]"
            className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2"
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <span className="px-2">{label}</span>
    </label>
  );
};

export type { RadioProps };
export { Radio };

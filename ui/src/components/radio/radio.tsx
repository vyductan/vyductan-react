import type * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@acme/ui/lib/utils";

import type { ButtonColorVariants } from "../button/button-variants";
import type { AbstractCheckboxProps } from "../checkbox";
import type { FormValueType } from "../form";
import type { RadioChangeEvent } from "./types";
import { Icon } from "../../icons";
import { buttonVariants } from "../button";
import { buttonColorVariants } from "../button/button-variants";

type RadioProps<T extends FormValueType = FormValueType> =
  AbstractCheckboxProps<RadioChangeEvent<T>, T> & {
    color?: ButtonColorVariants["color"];
    optionType?: "default" | "button";
    buttonStyle?: "outline" | "solid";
  };

const Radio = <T extends FormValueType = FormValueType>({
  value,
  checked,
  children,
  disabled,
  className,
  color = "default",
  optionType,
  buttonStyle,
  onChange,
  ...props
}: RadioProps<T>) => {
  const variant =
    buttonStyle === "solid"
      ? checked
        ? "solid"
        : "outlined"
      : checked
        ? "outlined"
        : "link";
  let mergedColor = color;
  if (checked && buttonStyle === "outline" && color === "default") {
    mergedColor = "primary";
  }

  if (optionType === "button") {
    return (
      <label
        className={cn(
          "-mr-px",
          buttonVariants({
            size: "middle",
          }),
          buttonColorVariants({
            color: mergedColor,
            variant,
            disabled,
          }),
          buttonStyle === "outline" && !checked && "border-input",
          buttonStyle === "outline" &&
            disabled &&
            "hover:border-input! bg-muted/80",

          // Override rounded for group buttons: first has left rounded, last has right rounded
          "rounded-none first:rounded-l-md last:rounded-r-md",
          // Add z-index for active item to ensure it appears above adjacent buttons
          checked && "relative z-10",
          className,
        )}
      >
        <RadioGroupPrimitive.Item
          value={value as string}
          disabled={disabled}
          {...props}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (disabled) return;
            const event: RadioChangeEvent<T> = {
              type: "change" as const,
              target: {
                ...props,
                value: value as unknown as T,
                // label: children,
                disabled,
                color,
                optionType,
                buttonStyle,
                checked: true,
                type: "radio" as const,
              },
              stopPropagation: () => e.stopPropagation(),
              preventDefault: () => e.preventDefault(),
              nativeEvent: e.nativeEvent,
            };
            onChange?.(event);
            props.onClick?.(e);
          }}
        >
          <span>{children}</span>
        </RadioGroupPrimitive.Item>
      </label>
    );
  }

  return (
    <label
      className={cn(
        "flex items-center",
        "cursor-pointer text-sm",
        // disabled &&
        //   "text-foreground [&>button]:border-foreground cursor-not-allowed opacity-30",
        buttonVariants({
          size: "middle",
        }),
        buttonColorVariants({
          variant: "link",
          color,
          disabled,
        }),
        "size-auto gap-0 p-0",
        color === "default" && "hover:text-foreground",
        className,
      )}
    >
      <RadioGroupPrimitive.Item
        data-slot="radio-group-item"
        value={value as string}
        className={cn(
          "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          // [
          //   buttonVariants({
          //     disabled,
          //     variant: "link",
          //     color,
          //   }),
          //   "size-auto gap-0 p-0",
          // ],
        )}
        disabled={disabled}
        {...props}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (disabled) return;
          const event: RadioChangeEvent<T> = {
            type: "change" as const,
            target: {
              ...props,
              value: value as unknown as T,
              // label: children,
              disabled,
              color,
              optionType,
              buttonStyle,
              checked: true,
              type: "radio" as const,
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
          className={cn("relative flex items-center justify-center", [
            buttonColorVariants({
              variant: "link",
              color,
              disabled,
            }),
            "size-auto gap-0 p-0",
          ])}
        >
          <Icon
            icon="icon-[bi--circle-fill]"
            className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2"
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <span className="px-2">{children}</span>
    </label>
  );
};

export type { RadioProps };
export { Radio };

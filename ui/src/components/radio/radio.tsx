/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@acme/ui/lib/utils";

import type { ButtonColorVariants } from "../button/button-variants";
import type { AbstractCheckboxProps } from "../checkbox";
import type { RadioChangeEvent } from "./types";
import { Icon } from "../../icons";
import { buttonVariants } from "../button";
import {
  buttonColorVariants,
  disabledVariants,
} from "../button/button-variants";

type RadioProps = AbstractCheckboxProps<RadioChangeEvent> & {
  label?: React.ReactNode;
  value?: any;
  color?: ButtonColorVariants["color"];
  optionType?: "default" | "button";
  buttonStyle?: "outline" | "solid";
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
  const variant =
    buttonStyle === "solid"
      ? isActive
        ? "solid"
        : "outlined"
      : isActive
        ? "outlined"
        : "link";
  let mergedColor = color;
  if (isActive && buttonStyle === "outline" && color === "default") {
    mergedColor = "primary";
  }
  // if (label === "Default" && buttonStyle === "outline") {
  //   console.log(
  //     "color",
  //     color,
  //     "variant",
  //     variant,
  //     "isActive",
  //     isActive,
  //     buttonVariants({
  //       disabled,
  //       color,
  //       variant,
  //     }),
  //   );
  // }

  if (optionType === "button") {
    return (
      <label
        className={cn(
          // "ring-offset-background inline-flex cursor-pointer items-center justify-center px-3 py-[5px] text-sm font-medium whitespace-nowrap",
          // "-mr-px border first:rounded-s-md last:mr-0 last:rounded-e-md",
          // "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden",
          // buttonStyle === "outline" && radioColors[color],
          // buttonStyle === "solid" && !isActive && "bg-white",
          // buttonStyle === "solid" && !isActive && radioColors[color],
          // disabled && "pointer-events-none cursor-not-allowed opacity-50",
          // buttonStyle === "solid" && !isActive && radioButtonSolidColors[color],
          // buttonStyle === "solid" &&
          //   !isActive &&
          //   preColor &&
          //   radioButtonSolidColors[preColor]?.split(" ")[1],
          // isActive &&
          //   buttonStyle === "solid" &&
          //   radioButtonSolidActiveColors[color] +
          //     " relative z-10 shadow-xs [&>button]:text-white",
          // isActive &&
          //   buttonStyle === "outline" &&
          //   radioButtonOutlineActiveColors[color] + " relative z-10",
          "-mr-px",
          buttonVariants({
            size: "middle",
          }),
          buttonColorVariants({
            color: mergedColor,
            variant,
          }),
          disabledVariants({
            disabled,
          }),
          buttonStyle === "outline" && !isActive && "border-input",

          // Override rounded for group buttons: first has left rounded, last has right rounded
          "rounded-none first:rounded-l-md last:rounded-r-md",
          // Add z-index for active item to ensure it appears above adjacent buttons
          isActive && "relative z-10",
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
              type: "change" as const,
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
          <span>{label}</span>
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
        // disabled &&
        // "text-foreground [&>button]:border-foreground cursor-not-allowed opacity-30",
        buttonVariants({
          size: "middle",
        }),
        buttonColorVariants({
          variant: "link",
          color,
        }),
        disabledVariants({
          disabled,
        }),
        "size-auto gap-0 p-0",
        color === "default" && "hover:text-foreground",
        className,
      )}
    >
      <RadioGroupPrimitive.Item
        data-slot="radio-group-item"
        value={value}
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
          const event = {
            type: "change" as const,
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
            }),
            disabledVariants({
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
      <span className="px-2">{label}</span>
    </label>
  );
};

export type { RadioProps };
export { Radio };

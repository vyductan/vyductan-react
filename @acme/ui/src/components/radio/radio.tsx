import type * as React from "react";
import { useId } from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@acme/ui/lib/utils";

import type { ButtonColorVariants } from "../button/button-variants";
import type { AbstractCheckboxProps as AbstractCheckboxProperties } from "../checkbox";
import type { FormValueType } from "../form";
import type { RadioChangeEvent } from "./types";
import { Icon } from "../../icons";
import { buttonVariants } from "../button";
import { buttonColorVariants } from "../button/button-variants";
import { inputDisabledVariants } from "../input/variants";

type RadioProperties<T extends FormValueType = FormValueType> =
  AbstractCheckboxProperties<RadioChangeEvent<T>, T> & {
    color?: ButtonColorVariants["color"];
    optionType?: "default" | "button";
    buttonStyle?: "outline" | "solid";
    variant?: "default" | "card";
  };

const Radio = <T extends FormValueType = FormValueType>({
  value,
  checked,
  children,
  description,
  disabled,
  className,
  color = "default",
  optionType,
  buttonStyle,
  variant = "default",
  onChange,
  ...properties
}: RadioProperties<T>) => {
  const labelId = useId();
  const descriptionId = useId();
  const hasDescription = !!description;

  const buttonColorVariant =
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
            variant: buttonColorVariant,
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
          {...properties}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (disabled) return;
            const event: RadioChangeEvent<T> = {
              type: "change" as const,
              target: {
                ...properties,
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
            properties.onClick?.(e);
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
        "flex",
        hasDescription ? "items-start" : "items-center",
        "cursor-pointer text-sm",
        // disabled &&
        //   "text-foreground [&>button]:border-foreground cursor-not-allowed opacity-30",
        variant === "card"
          ? [
              "hover:bg-accent/50 items-start gap-2 rounded-md border",
              "h-auto min-h-8 px-3 py-2",
              "has-aria-checked:border-primary-600 has-aria-checked:bg-primary-50",
              "dark:has-aria-checked:border-primary-900 dark:has-aria-checked:bg-primary-950",
              inputDisabledVariants({ disabled }),
              // group-level disabled (children pattern) reaches only the inner
              // item via Radix context; mirror the disabled look from its
              // data-disabled attribute
              "has-data-disabled:pointer-events-none has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50",
            ]
          : [
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
            ],
        className,
      )}
    >
      <RadioGroupPrimitive.Item
        data-slot="radio-group-item"
        value={value as string}
        className={cn(
          "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          (variant === "card" || hasDescription) && "self-start",
          variant === "card" && [
            "data-[state=checked]:border-primary-600",
            "dark:data-[state=checked]:border-primary-700",
          ],
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
        aria-labelledby={hasDescription ? labelId : undefined}
        aria-describedby={hasDescription ? descriptionId : undefined}
        {...properties}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (disabled) return;
          const event: RadioChangeEvent<T> = {
            type: "change" as const,
            target: {
              ...properties,
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
          properties.onClick?.(e);
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
      {variant === "card" ? (
        hasDescription ? (
          <div className="flex w-full flex-col gap-1">
            <div id={labelId} className="leading-none font-medium">
              {children}
            </div>
            <p
              id={descriptionId}
              className="text-muted-foreground text-xs font-normal"
            >
              {description}
            </p>
          </div>
        ) : (
          <div className="mt-px flex w-full flex-col gap-0.5 leading-none font-medium">
            {children}
          </div>
        )
      ) : hasDescription ? (
        <div className="flex flex-col gap-1 px-2">
          <div id={labelId} className="leading-4">
            {children}
          </div>
          <p
            id={descriptionId}
            className="text-muted-foreground text-xs font-normal"
          >
            {description}
          </p>
        </div>
      ) : (
        <span className="px-2">{children}</span>
      )}
    </label>
  );
};

export type { RadioProperties as RadioProps };
export { Radio };

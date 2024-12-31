import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import type { ValueType } from "../form";
import type { RadioProps } from "./radio";
import { cn } from "..";
import { Radio } from "./radio";

type RadioOption<TValue extends string | number | boolean = string> = {
  label: React.ReactNode;
  value: TValue;
  color?: string;
  disabled?: boolean;
};
type RadioGroupProps<TValue extends string | number | boolean = string> = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
  "defaultValue" | "onChange"
> &
  Pick<RadioProps, "optionType" | "buttonStyle"> & {
    defaultValue?: HTMLInputElement["defaultValue"];
    options: RadioOption<TValue>[];
    onChange?: RadioGroupPrimitive.RadioGroupProps["onValueChange"];
  };
const RadioGroupInner = <T extends ValueType = string>(
  {
    className,
    options,
    onChange,
    optionType,
    buttonStyle,
    disabled,
    ...props
  }: RadioGroupProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn(buttonStyle ? "" : "flex gap-2", className)}
      onValueChange={onChange}
      disabled={disabled}
      {...props}
    >
      {options.map((option, index) => (
        <Radio
          key={index}
          {...option}
          disabled={disabled ?? option.disabled}
          optionType={optionType}
          buttonStyle={buttonStyle}
          isActive={option.value === props.value}
          preColor={options[index + 1] ? options[index + 1]?.color : undefined}
        />
      ))}
    </RadioGroupPrimitive.Root>
  );
};
RadioGroupInner.displayName = RadioGroupPrimitive.Root.displayName;

export type { RadioGroupProps, RadioOption };

export const RadioGroup = React.forwardRef(RadioGroupInner) as <
  T extends ValueType,
>(
  props: RadioGroupProps<T> & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  },
) => ReturnType<typeof RadioGroupInner>;

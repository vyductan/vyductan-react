import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@acme/ui/lib/utils";

import type { RadioProps } from "./radio";
import { Radio } from "./radio";

type RadioOption = {
  label: React.ReactNode;
  value: any;
  color?: string;
  disabled?: boolean;
};
type RadioGroupProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
  "defaultValue" | "onChange"
> &
  Pick<RadioProps, "optionType" | "buttonStyle"> & {
    defaultValue?: HTMLInputElement["defaultValue"];
    options: RadioOption[];
    onChange?: RadioGroupPrimitive.RadioGroupProps["onValueChange"];
  };
const RadioGroupInner = (
  {
    className,
    options,
    onChange,
    optionType,
    buttonStyle,
    disabled,
    ...props
  }: RadioGroupProps,
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

export const RadioGroup = React.forwardRef(RadioGroupInner) as (
  props: RadioGroupProps & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  },
) => ReturnType<typeof RadioGroupInner>;

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@acme/ui/lib/utils";

import type { ButtonColorVariants } from "../button/button-variants";
import type { RadioProps } from "./radio";
import { Radio } from "./radio";

type RadioOption = {
  label: React.ReactNode;
  value: any;
  color?: ButtonColorVariants["color"];
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
    optionType = "default",
    buttonStyle = "outline",
    disabled,
    ...props
  }: RadioGroupProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    props.defaultValue,
  );

  const isControlled = props.value !== undefined;
  const currentValue = isControlled ? props.value : internalValue;

  const handleValueChange = (value: string) => {
    if (!isControlled) {
      setInternalValue(value);
    }
    onChange?.(value);
  };

  React.useEffect(() => {
    if (props.defaultValue !== undefined && !isControlled) {
      setInternalValue(props.defaultValue);
    }
  }, [props.defaultValue, isControlled]);

  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn(
        optionType === "button" ? "inline-flex" : "flex gap-2",
        className,
      )}
      value={currentValue}
      onValueChange={handleValueChange}
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
          isActive={option.value === currentValue}
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

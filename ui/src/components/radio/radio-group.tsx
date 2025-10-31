import { useMemo } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useControlledState } from "@rc-component/util";

import { cn } from "@acme/ui/lib/utils";

import type {
  AbstractCheckboxGroupProps,
  CheckboxOptionType,
} from "../checkbox/checkbox-group";
import type { FormValueType } from "../form";
import type { RadioProps } from "./radio";
import type { RadioChangeEvent } from "./types";
import { Radio } from "./radio";

type RadioOptionType<T extends FormValueType = FormValueType> =
  CheckboxOptionType<T>;

type RadioGroupProps<T extends FormValueType = FormValueType> =
  AbstractCheckboxGroupProps<T> &
    Pick<RadioProps, "optionType" | "buttonStyle"> & {
      defaultValue?: T;
      value?: T;
      onChange?: (e: RadioChangeEvent<T>) => void;
    };
export const RadioGroup = <T extends FormValueType = FormValueType>({
  value,
  defaultValue,
  className,
  options,
  onChange,
  optionType = "default",
  buttonStyle = "outline",
  disabled,
  ...props
}: RadioGroupProps<T>) => {
  const [internalValue, setInternalValue] = useControlledState(
    defaultValue,
    value,
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const memoizedOptions = useMemo<RadioOptionType<T>[]>(
    () =>
      (options ?? []).map((option) => {
        if (typeof option === "string" || typeof option === "number") {
          return { label: option, value: option } as RadioOptionType<T>;
        }
        return option;
      }),
    [options],
  );

  return (
    <RadioGroupPrimitive.Root
      className={cn(
        optionType === "button" ? "inline-flex" : "flex gap-2",
        className,
      )}
      value={currentValue as string | undefined}
      // onValueChange={handleValueChange}
      disabled={disabled}
      {...props}
    >
      {memoizedOptions.map((option) => {
        const isDisabled = option.disabled ?? disabled;
        return (
          <Radio
            key={option.value.toString()}
            {...option}
            // value={option.value}
            checked={option.value === currentValue}
            disabled={isDisabled}
            optionType={optionType}
            buttonStyle={buttonStyle}
            onChange={(e) => {
              console.log("e", e);
              if (isDisabled) return;

              if (e.target.checked) {
                setInternalValue(option.value);
                onChange?.(e);
              }
            }}
          >
            {option.label}
          </Radio>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
};

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export type { RadioGroupProps, RadioOptionType };

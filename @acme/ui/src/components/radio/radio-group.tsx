import { useMemo } from "react";
import { useControlledState } from "@rc-component/util";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@acme/ui/lib/utils";

import type {
  AbstractCheckboxGroupProps as AbstractCheckboxGroupProperties,
  CheckboxOptionType,
} from "../checkbox/checkbox-group";
import type { FormValueType } from "../form";
import type { RadioProps as RadioProperties } from "./radio";
import type { RadioChangeEvent } from "./types";
import { Radio } from "./radio";

type RadioOptionType<T extends FormValueType = FormValueType> =
  CheckboxOptionType<T>;

type RadioGroupProperties<T extends FormValueType = FormValueType> =
  AbstractCheckboxGroupProperties<T> &
    Pick<RadioProperties, "optionType" | "buttonStyle"> & {
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
  ...properties
}: RadioGroupProperties<T>) => {
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
      {...properties}
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

export type { RadioGroupProperties as RadioGroupProps, RadioOptionType };

import { useMemo } from "react";
import { useControlledState } from "@rc-component/util";

import type { ButtonColorVariants } from "../button/button-variants";
import type { FormValueType } from "../form";
import type { CheckboxChangeEvent } from "./checkbox";
import { cn } from "../../lib/utils";
import { Checkbox } from "./checkbox";

export interface CheckboxOptionType<T extends FormValueType = FormValueType> {
  label: React.ReactNode;
  value: T;
  style?: React.CSSProperties;
  className?: string; // 👈 5.25.0+
  disabled?: boolean;
  title?: string;
  id?: string;
  onChange?: (e: CheckboxChangeEvent<T>) => void;
  required?: boolean;

  color?: ButtonColorVariants["color"];
}

export interface AbstractCheckboxGroupProps<
  T extends FormValueType = FormValueType,
> {
  options?: CheckboxOptionType<T>[];
  style?: React.CSSProperties;
  className?: string;
  classNames?: {
    item?: string;
    label?: string;
  };
  disabled?: boolean;
  optionVariant?: "default" | "card";
}

type CheckboxGroupProps<T extends FormValueType = FormValueType> =
  AbstractCheckboxGroupProps<T> & {
    name?: string;
    value?: T[];
    defaultValue?: T[];
    onChange?: (checkedValues: T[]) => void;
  };

function CheckboxGroup<T extends FormValueType = FormValueType>({
  name,
  value,
  defaultValue,
  options = [],
  onChange,
  disabled,
  className,
  classNames,
  optionVariant = "default",
}: CheckboxGroupProps<T>): React.JSX.Element {
  const [internalValue, setInternalValue] = useControlledState(
    defaultValue,
    value,
  );

  const memoizedOptions = useMemo<CheckboxOptionType<T>[]>(
    () =>
      options.map((option) => {
        if (typeof option === "string" || typeof option === "number") {
          return { label: option, value: option } as CheckboxOptionType<T>;
        }
        return option;
      }),
    [options],
  );

  return (
    <div
      data-slot="checkbox-group"
      className={cn("inline-flex flex-wrap gap-2", className)}
    >
      {memoizedOptions.map((o) => {
        const isDisabled = o.disabled ?? disabled;
        const isSelected = !!internalValue?.includes(o.value);
        const optionKey = o.value.toString();

        const checkbox = (
          <Checkbox
            key={optionKey}
            name={name}
            checked={isSelected}
            value={o.value as string}
            disabled={isDisabled}
            variant={optionVariant === "card" ? "card" : "default"}
            onChange={(e) => {
              if (isDisabled) return;

              const nextValue = e.target.checked
                ? [...(internalValue ?? []), o.value]
                : internalValue?.filter((x) => x !== o.value);

              setInternalValue(nextValue);
              onChange?.(nextValue ?? []);
            }}
            className={cn(
              optionVariant === "card" ? "w-full" : undefined,
              optionVariant === "card" ? undefined : classNames?.item,
              o.className,
            )}
            classNames={classNames}
          >
            {o.label}
          </Checkbox>
        );

        if (optionVariant !== "card") {
          return checkbox;
        }

        return (
          <div
            key={optionKey}
            data-slot="checkbox-group-option"
            data-option-variant="card"
            data-selected={isSelected ? "true" : "false"}
            data-disabled={isDisabled ? "true" : "false"}
            className={cn(
              "rounded-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              classNames?.item,
            )}
          >
            {checkbox}
          </div>
        );
      })}
    </div>
  );
};

export type { CheckboxGroupProps };
export { CheckboxGroup };

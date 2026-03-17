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
}

type CheckboxGroupProps<T extends FormValueType = FormValueType> =
  AbstractCheckboxGroupProps<T> & {
    name?: string;
    value?: T[];
    defaultValue?: T[];
    onChange?: (checkedValues: T[]) => void;
  };
const CheckboxGroup = <T extends FormValueType = FormValueType>({
  name,
  value,
  defaultValue,
  options = [],
  onChange,
  disabled,
  className,
  classNames,
}: CheckboxGroupProps<T>) => {
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
        return (
          <Checkbox
            key={o.value.toString()}
            name={name}
            checked={internalValue?.includes(o.value)}
            value={o.value as string}
            disabled={isDisabled}
            onChange={(e) => {
              if (isDisabled) return;

              const newValue = e.target.checked
                ? [...(internalValue ?? []), o.value]
                : internalValue?.filter((x) => x !== o.value);

              setInternalValue(newValue);
              onChange?.(newValue ?? []);
            }}
            className={cn(classNames?.item, o.className)}
            classNames={classNames}
          >
            {o.label}
          </Checkbox>
        );
      })}
    </div>
  );
};

export type { CheckboxGroupProps };
export { CheckboxGroup };

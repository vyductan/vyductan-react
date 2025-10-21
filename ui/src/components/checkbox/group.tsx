import { useMemo } from "react";
import { useControlledState } from "@rc-component/util";

import type { FormValueType } from "../form";
import type { CheckboxChangeEvent } from "./checkbox";
import { cn } from "../../lib/utils";
import { Checkbox } from "./checkbox";

export interface CheckboxOptionType<T = FormValueType> {
  label: React.ReactNode;
  value: T;
  style?: React.CSSProperties;
  className?: string; // 👈 5.25.0+
  disabled?: boolean;
  title?: string;
  id?: string;
  onChange?: (e: CheckboxChangeEvent) => void;
  required?: boolean;
}

type CheckboxGroupProps<T extends FormValueType> = {
  name?: string;
  value?: T[];
  defaultValue?: T[];
  options?: (CheckboxOptionType<T> | string | number)[];
  onChange?: (checkedValues: T[]) => void;
  disabled?: boolean;

  className?: string;
  classNames?: {
    item: string;
  };
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
    defaultValue ?? [],
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
            checked={internalValue.includes(o.value)}
            value={o.value as string}
            disabled={isDisabled}
            onChange={(e) => {
              if (isDisabled) return;

              const newValue = e.target.checked
                ? [...internalValue, o.value]
                : internalValue.filter((x) => x !== o.value);

              setInternalValue(newValue);
              onChange?.(newValue);
            }}
            className={cn(classNames?.item, o.className)}
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

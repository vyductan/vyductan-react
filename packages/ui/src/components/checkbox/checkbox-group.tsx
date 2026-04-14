import { useMemo } from "react";
import { useControlledState } from "@rc-component/util";

import type { ButtonColorVariants } from "../button/button-variants";
import type { CheckboxChangeEvent, CheckboxProps as CheckboxProperties } from "./checkbox";
import type { CheckboxValueType } from "./group-context";
import { cn } from "../../lib/utils";
import { Checkbox } from "./checkbox";

export interface CheckboxOptionType<
  T extends CheckboxValueType = CheckboxValueType,
> {
  label: React.ReactNode;
  value: T;
  style?: React.CSSProperties;
  className?: string; // 👈 5.25.0+
  description?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  onChange?: (e: CheckboxChangeEvent<T>) => void;
  required?: boolean;

  color?: ButtonColorVariants["color"];
}

export interface AbstractCheckboxGroupProps<
  T extends CheckboxValueType = CheckboxValueType,
> {
  options?: CheckboxOptionType<T>[];
  style?: React.CSSProperties;
  className?: string;
  classNames?: {
    item?: string;
    label?: string;
  };
  disabled?: boolean;
  optionVariant?: CheckboxProperties["variant"];
  size?: "small" | "middle" | "large";
}

type CheckboxGroupProperties<T extends CheckboxValueType = CheckboxValueType> =
  AbstractCheckboxGroupProps<T> & {
    name?: string;
    value?: T[];
    defaultValue?: T[];
    onChange?: (checkedValues: T[]) => void;
  };
const CheckboxGroup = <T extends CheckboxValueType = CheckboxValueType>({
  name,
  value,
  defaultValue,
  options = [],
  onChange,
  disabled,
  style,
  className,
  classNames,
  optionVariant,
  size,
}: CheckboxGroupProperties<T>) => {
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
      style={style}
      className={cn("inline-flex flex-wrap gap-2", className)}
    >
      {memoizedOptions.map((o) => {
        const isDisabled = o.disabled ?? disabled;
        return (
          <Checkbox
            key={o.value.toString()}
            id={o.id}
            name={name}
            required={o.required}
            style={o.style}
            checked={internalValue?.includes(o.value)}
            value={o.value}
            disabled={isDisabled}
            onChange={(e) => {
              if (isDisabled) return;

              const newValue = e.target.checked
                ? [...(internalValue ?? []), o.value]
                : internalValue?.filter((x) => x !== o.value);

              setInternalValue(newValue);
              o.onChange?.(e);
              onChange?.(newValue ?? []);
            }}
            className={cn(classNames?.item, o.className)}
            classNames={classNames}
            variant={optionVariant}
            size={size}
          >
            {o.description ? (
              <div className="grid gap-1.5 font-normal">
                <p className="text-sm leading-none font-medium">{o.label}</p>
                <p className="text-muted-foreground text-sm">{o.description}</p>
              </div>
            ) : (
              o.label
            )}
          </Checkbox>
        );
      })}
    </div>
  );
};

export type { CheckboxGroupProperties as CheckboxGroupProps };
export { CheckboxGroup };

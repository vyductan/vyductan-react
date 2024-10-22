import { forwardRef } from "react";

import type { ValueType } from "../form";
import { Checkbox } from "./checkbox";

type CheckboxGroupProps<T extends ValueType> = {
  name?: string;
  value?: T[];
  options?: { label: string; value: T }[];
  onChange?: (checkedValue: T[]) => void;
};
const CheckboxGroupInner = <T extends ValueType = string>(
  { name, value, options = [], onChange }: CheckboxGroupProps<T>,
  _: React.ForwardedRef<HTMLInputElement>,
) => {
  return (
    <div>
      {options.map((o) => {
        return (
          <Checkbox
            key={o.value.toString()}
            name={name}
            checked={value?.includes(o.value)}
            value={o.value as string}
            onChange={(checked) => {
              onChange?.(
                checked
                  ? [...(value ?? []), o.value]
                  : (value ?? []).filter((x) => x !== o.value),
              );
            }}
          >
            {o.label}
          </Checkbox>
        );
      })}
    </div>
  );
};

export const CheckboxGroup = forwardRef(CheckboxGroupInner) as <
  T extends ValueType,
>(
  props: CheckboxGroupProps<T> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  },
) => ReturnType<typeof CheckboxGroupInner>;

import type { ValueType } from "../form";
import type { CheckboxChangeEvent } from "./checkbox";
import { cn } from "../../lib/utils";
import { Checkbox } from "./checkbox";

export interface CheckboxOptionType<T = any> {
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

type CheckboxGroupProps<T extends ValueType> = {
  name?: string;
  value?: T[];
  options?: { label: string; value: T }[];
  onChange?: (checkedValues: T[]) => void;

  className?: string;
  classNames?: {
    item: string;
  };
};
const CheckboxGroup = <T extends ValueType = string>({
  name,
  value,
  options = [],
  onChange,
  className,
  classNames,
}: CheckboxGroupProps<T>) => {
  return (
    <div
      data-slot="checkbox-group"
      className={cn("inline-flex flex-wrap gap-2", className)}
    >
      {options.map((o) => {
        return (
          <Checkbox
            key={o.value.toString()}
            name={name}
            checked={value?.includes(o.value)}
            value={o.value as string}
            onChange={(e) => {
              onChange?.(
                e.target.checked
                  ? [...(value ?? []), o.value]
                  : (value ?? []).filter((x) => x !== o.value),
              );
            }}
            className={classNames?.item}
          >
            {o.label}
          </Checkbox>
        );
      })}
    </div>
  );
};

export { CheckboxGroup };

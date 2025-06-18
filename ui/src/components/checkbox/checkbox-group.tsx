import type { ValueType } from "../form";
import { cn } from "../../lib/utils";
import { Checkbox } from "./checkbox";

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
            onChange={(checked) => {
              onChange?.(
                checked
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

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import type { ValueType } from "../form";
import { clsm } from "..";
import { Radio } from "./Radio";

type RadioOption<TValue extends string | number | boolean = string> = {
  label: React.ReactNode;
  value: TValue;
  disabled?: boolean;
};
type RadioGroupProps<TValue extends string | number | boolean = string> = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
  "defaultValue" | "onChange"
> & {
  defaultValue?: HTMLInputElement["defaultValue"];
  options: RadioOption<TValue>[];
  onChange?: RadioGroupPrimitive.RadioGroupProps["onValueChange"];
};
const RadioGroupInner = <T extends ValueType = string>(
  { className, options, onChange, ...props }: RadioGroupProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
  return (
    <>
      <RadioGroupPrimitive.Root
        className={clsm("flex gap-2", className)}
        onValueChange={onChange}
        {...props}
        ref={ref}
      >
        {options.map((option, index) => (
          <Radio key={index} {...option} />
        ))}
      </RadioGroupPrimitive.Root>
    </>
  );
};
RadioGroupInner.displayName = RadioGroupPrimitive.Root.displayName;

export type { RadioGroupProps, RadioOption };

export const RadioGroup = React.forwardRef(RadioGroupInner) as <
  T extends ValueType,
>(
  props: RadioGroupProps<T> & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  },
) => ReturnType<typeof RadioGroupInner>;

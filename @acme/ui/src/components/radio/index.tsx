import type { XOR } from "ts-xor";

import type { FormValueType } from "../form";
import type { RadioGroupProps as RadioGroupProperties } from "./radio-group";
import { RadioGroupRoot } from "./_components";
import { RadioGroup } from "./radio-group";

export * from "./radio";
export * from "./types";

// export * from "./_components";

type XorProperties<T extends FormValueType = FormValueType> = XOR<
  RadioGroupProperties<T>,
  React.ComponentProps<typeof RadioGroupRoot>
>;
const ConditionRadioGroup = <T extends FormValueType = FormValueType>(
  properties: XorProperties<T>,
) => {
  const isShadcnRadioGroup = !properties.options;
  if (isShadcnRadioGroup) {
    // Radix Root only emits `onValueChange`. When wrapped in <Field> (RHF),
    // the field injects `onChange(value)` — bridge it so selection updates form.
    const { onChange, onValueChange, ...rest } = properties as Omit<
      React.ComponentProps<typeof RadioGroupRoot>,
      "onChange"
    > & { onChange?: (value: string) => void };
    return (
      <RadioGroupRoot
        {...rest}
        onValueChange={(value) => {
          onValueChange?.(value);
          onChange?.(value);
        }}
      />
    );
  }
  return <RadioGroup {...(properties as RadioGroupProperties<T>)} />;
};

export {
  ConditionRadioGroup as RadioGroup,
  ConditionRadioGroup as RadioGroupRoot,
};
export { RadioGroupItem } from "./_components";

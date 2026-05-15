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
    return (
      <RadioGroupRoot
        {...(properties as React.ComponentProps<typeof RadioGroupRoot>)}
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

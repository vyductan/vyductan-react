import type { XOR } from "ts-xor";

import type { FormValueType } from "../form";
import type { RadioGroupProps } from "./radio-group";
import { RadioGroupRoot } from "./_components";
import { RadioGroup } from "./radio-group";

export * from "./radio";
export * from "./types";

// export * from "./_components";

type XorProps<T extends FormValueType = FormValueType> = XOR<
  RadioGroupProps<T>,
  React.ComponentProps<typeof RadioGroupRoot>
>;
const ConditionRadioGroup = <T extends FormValueType = FormValueType>(
  props: XorProps<T>,
) => {
  const isShadcnRadioGroup = !props.options;
  if (isShadcnRadioGroup) {
    return (
      <RadioGroupRoot
        {...(props as React.ComponentProps<typeof RadioGroupRoot>)}
      />
    );
  }
  return <RadioGroup {...(props as RadioGroupProps<T>)} />;
};

export {
  ConditionRadioGroup as RadioGroup,
  ConditionRadioGroup as RadioGroupRoot,
};
export { RadioGroupItem } from "./_components";

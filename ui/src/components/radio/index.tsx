import type { XOR } from "ts-xor";

import type { RadioGroupProps } from "./radio-group";
import { RadioGroupRoot } from "./_components";
import { RadioGroup } from "./radio-group";

export * from "./radio";

// export * from "./_components";

type XorProps = XOR<
  RadioGroupProps,
  React.ComponentProps<typeof RadioGroupRoot>
>;
const ConditionRadioGroup = (props: XorProps) => {
  const isShadcnRadioGroup = !props.options;
  if (isShadcnRadioGroup) {
    return <RadioGroupRoot {...props} />;
  }
  return <RadioGroup {...props} />;
};

export {
  ConditionRadioGroup as RadioGroup,
  ConditionRadioGroup as RadioGroupRoot,
};
export { RadioGroupItem } from "./_components";

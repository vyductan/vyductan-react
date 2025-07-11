import type { XOR } from "ts-xor";

import { Checkbox as ShadcnCheckbox } from "@acme/ui/shadcn/checkbox";

import type { CheckboxProps } from "./checkbox";
import { Checkbox as OwnCheckbox } from "./checkbox";

export * from "./checkbox";
export * from "./group";

type ShadcnCheckboxProps = Omit<
  React.ComponentProps<typeof ShadcnCheckbox>,
  "onChange"
>;

type XORCheckboxProps = XOR<CheckboxProps, ShadcnCheckboxProps>;

const Checkbox = (props: XORCheckboxProps) => {
  const isShadcnCheckbox = props.onCheckedChange !== undefined;

  if (isShadcnCheckbox) {
    return <ShadcnCheckbox {...props} />;
  }

  return <OwnCheckbox {...(props as CheckboxProps)} />;
};

export { Checkbox };

export { type CheckboxProps } from "./checkbox";

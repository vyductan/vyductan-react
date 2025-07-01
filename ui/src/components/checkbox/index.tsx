import type { XOR } from "ts-xor";

import { Checkbox as ShadcnCheckbox } from "@acme/ui/shadcn/checkbox";

import type { OwnCheckboxProps } from "./checkbox";
import { Checkbox as OwnCheckbox } from "./checkbox";

export * from "./checkbox";
export * from "./group";

type ShadcnCheckboxProps = Omit<
  React.ComponentProps<typeof ShadcnCheckbox>,
  "onChange"
>;

type CheckboxProps = XOR<OwnCheckboxProps, ShadcnCheckboxProps>;

const Checkbox = (props: CheckboxProps) => {
  const isShadcnCheckbox = props.onCheckedChange !== undefined;

  if (isShadcnCheckbox) {
    return <ShadcnCheckbox {...props} />;
  }

  return <OwnCheckbox {...(props as OwnCheckboxProps)} />;
};

export type { CheckboxProps };

export { Checkbox };

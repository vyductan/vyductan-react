"use client";

import type { XOR } from "ts-xor";

import { Checkbox as ShadcnCheckbox } from "@acme/ui/shadcn/checkbox";

import type { CheckboxProps } from "./checkbox";
import { Checkbox as InternalCheckbox } from "./checkbox";
import { CheckboxGroup } from "./checkbox-group";

export * from "./checkbox";
export * from "./checkbox-group";

type ShadcnCheckboxProps = Omit<
  React.ComponentProps<typeof ShadcnCheckbox>,
  "onChange"
>;

type XORCheckboxProps = XOR<CheckboxProps, ShadcnCheckboxProps>;

type InternalCheckboxType = typeof InternalCheckbox;

type CompoundedComponent = InternalCheckboxType & {
  Group: typeof CheckboxGroup;
};

const Checkbox = ((props: XORCheckboxProps) => {
  const isShadcnCheckbox = props.onCheckedChange !== undefined;

  if (isShadcnCheckbox) {
    return <ShadcnCheckbox {...props} />;
  }

  return <InternalCheckbox {...(props as CheckboxProps)} />;
}) as unknown as CompoundedComponent;

Checkbox.Group = CheckboxGroup;

export { Checkbox };
export { CheckboxGroup } from "./checkbox-group";

export { type CheckboxProps } from "./checkbox";

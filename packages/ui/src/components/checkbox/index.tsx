"use client";

import * as React from "react";
import type { XOR } from "ts-xor";

import type { CheckboxProps as CheckboxProperties } from "./checkbox";
import { Checkbox as ShadcnCheckbox } from "../../shadcn/checkbox";
import { Checkbox as InternalCheckbox } from "./checkbox";
import { CheckboxGroup } from "./checkbox-group";

export * from "./checkbox";
export * from "./checkbox-group";

type ShadcnCheckboxProperties = Omit<
  React.ComponentProps<typeof ShadcnCheckbox>,
  "onChange"
>;

type XORCheckboxProperties = XOR<CheckboxProperties, ShadcnCheckboxProperties>;

const ConditionCheckbox = (properties: XORCheckboxProperties) => {
  const hasLabelContent = React.Children.toArray(properties.children).some(
    (child) => {
      if (typeof child === "boolean") {
        return false;
      }

      return child !== "";
    },
  );
  const isShadcnCheckbox =
    properties.onCheckedChange !== undefined || !hasLabelContent;

  if (isShadcnCheckbox) {
    return <ShadcnCheckbox {...(properties as ShadcnCheckboxProperties)} />;
  }

  return <InternalCheckbox {...(properties as CheckboxProperties)} />;
};

type InternalCheckboxType = typeof ConditionCheckbox;

type CompoundedComponent = InternalCheckboxType & {
  Group: typeof CheckboxGroup;
};
const Checkbox = ConditionCheckbox as unknown as CompoundedComponent;

Checkbox.Group = CheckboxGroup;

export { Checkbox };
export { CheckboxGroup } from "./checkbox-group";

export { type CheckboxProps } from "./checkbox";

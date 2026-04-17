"use client";

import type { XOR } from "ts-xor";
import * as React from "react";

import type { CheckboxChangeEvent, CheckboxProps } from "./checkbox";
import { CheckboxControl } from "./_components/checkbox-control";
import { Checkbox as InternalCheckbox } from "./checkbox";
import { CheckboxGroup } from "./checkbox-group";

export * from "./checkbox";
export * from "./checkbox-group";

type ShadcnCheckboxProps = Omit<
  React.ComponentProps<typeof CheckboxControl>,
  "onChange"
>;

type XORCheckboxProps = XOR<CheckboxProps, ShadcnCheckboxProps>;

const ConditionCheckbox = (props: XORCheckboxProps) => {
  const hasLabelContent = React.Children.toArray(props.children).some(
    (child) => {
      if (typeof child === "boolean") {
        return false;
      }

      return child !== "";
    },
  );
  const isShadcnCheckbox =
    props.onCheckedChange !== undefined || !hasLabelContent;

  // Keep the no-label path wrapper-free, but adapt onChange to preserve the public Checkbox API.
  if (isShadcnCheckbox) {
    const checkboxProps = props as CheckboxProps & ShadcnCheckboxProps;
    const { onChange, onCheckedChange, ...controlProperties } = checkboxProps;

    return (
      <CheckboxControl
        {...controlProperties}
        onCheckedChange={(nextChecked) => {
          onCheckedChange?.(nextChecked);
          onChange?.({
            type: "change",
            target: {
              name: checkboxProps.name,
              value:
                checkboxProps.value as unknown as CheckboxChangeEvent["target"]["value"],
              checked: nextChecked === "indeterminate" ? false : nextChecked,
              type: "checkbox",
            },
            nativeEvent: new MouseEvent("change"),
            preventDefault: () => {
              //
            },
            stopPropagation: () => {
              //
            },
          } satisfies CheckboxChangeEvent);
        }}
      />
    );
  }

  return <InternalCheckbox {...(props as CheckboxProps)} />;
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

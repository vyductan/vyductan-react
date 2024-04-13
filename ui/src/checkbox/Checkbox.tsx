import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { clsm } from "..";
import { Icon } from "../icons";

type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  "checked" | "defaultChecked" | "onChange" | "onCheckedChange"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
};
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    { checked, defaultChecked, className, indeterminate, onChange, ...props },
    ref,
  ) => {
    const id = React.useId();
    return (
      <label className={clsm("inline-flex", className)} htmlFor={id}>
        <CheckboxPrimitive.Root
          id={id}
          ref={ref}
          checked={indeterminate ? "indeterminate" : checked}
          defaultChecked={indeterminate ? "indeterminate" : defaultChecked}
          className={clsm(
            "peer size-4 shrink-0 self-center rounded-[4px]",
            "border border-ds-gray-500 bg-background ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white",
            "data-[state=indeterminate]:text-ds-gray-900",
            "hover:border-ds-gray-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          onCheckedChange={onChange}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={clsm("flex items-center justify-center text-current")}
          >
            {indeterminate ? (
              <Icon icon="ant-design:x-filled" className="size-[10px]" />
            ) : (
              <Icon icon="mingcute:check-fill" className="size-[14px]" />
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
      </label>
    );
  },
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

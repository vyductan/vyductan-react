import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "..";
import { LoadingIcon } from "../button";
import { Icon } from "../icons";

type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  "checked" | "defaultChecked" | "onChange" | "onCheckedChange"
> & {
  loading?: boolean;

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
    {
      id,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,

      loading,

      children,
      checked,
      defaultChecked,
      className,
      indeterminate,
      onChange,
      ...props
    },
    ref,
  ) => {
    return (
      <label
        id={id}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className={cn(
          "inline-flex items-baseline",
          "text-sm",
          loading && "items-center",
          className,
        )}
      >
        {loading ? (
          <LoadingIcon />
        ) : (
          <CheckboxPrimitive.Root
            ref={ref}
            checked={
              indeterminate
                ? "indeterminate"
                : typeof props.value === "boolean"
                  ? props.value
                  : checked
            }
            defaultChecked={indeterminate ? "indeterminate" : defaultChecked}
            className={cn(
              "peer size-4 self-center rounded-[4px]",
              "border border-gray-700 ring-offset-background",
              "transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white",
              "data-[state=indeterminate]:text-gray-900",
              "hover:bg-background-hover",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            onCheckedChange={onChange}
            {...props}
          >
            <CheckboxPrimitive.Indicator
              className={cn(
                "flex size-full items-center justify-center text-current",
              )}
            >
              {indeterminate ? (
                <Icon
                  icon="icon-[ant-design--x-filled]"
                  className="size-[10px]"
                />
              ) : (
                <Icon
                  icon="icon-[mingcute--check-fill]"
                  // className="size-4"
                  className="size-[14px]"
                />
              )}
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
        )}
        {children && <span className="cursor-pointer px-2">{children}</span>}
      </label>
    );
  },
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "..";
import { LoadingIcon } from "../button";
import { Icon } from "../icons";

type CheckboxProps = Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  "checked" | "defaultChecked" | "onChange" | "onCheckedChange"
> & {
  loading?: boolean;

  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
};
const Checkbox = ({
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
}: CheckboxProps) => {
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
          data-slot="checkbox"
          checked={
            indeterminate
              ? "indeterminate"
              : typeof props.value === "boolean"
                ? props.value
                : checked
          }
          defaultChecked={indeterminate ? "indeterminate" : defaultChecked}
          className={cn(
            "",
            "peer border-input size-4 rounded-[4px] border shadow-xs transition-[color,box-shadow]",
            "ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            "focus-visible:ring-4 focus-visible:outline-1 aria-invalid:focus-visible:ring-0",
            "data-[state=indeterminate]:text-gray-900",
            // "focus-visible:ring-offset-2 focus-visible:outline-hidden "
            // "hover:bg-background-hover",
            // "ring-offset-background"
            // "self-center",
          )}
          onCheckedChange={onChange}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            data-slot="checkbox-indicator"
            className={cn(
              "flex items-center justify-center text-current",
              "size-full",
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
};

export { Checkbox };

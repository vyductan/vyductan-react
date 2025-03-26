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
        "inline-flex items-center",
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
            "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
            // own
            "data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600",
          )}
          onCheckedChange={onChange}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            data-slot="checkbox-indicator"
            className={cn(
              "flex items-center justify-center text-current transition-none",
              // own
              "size-full",
            )}
          >
            {indeterminate ? (
              <Icon
                icon="icon-[ant-design--x-filled]"
                className="size-[10px]"
              />
            ) : (
              <Icon icon="icon-[lucide--check]" className="size-3.5" />
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
      )}
      {children && <span className="cursor-pointer px-2">{children}</span>}
    </label>
  );
};

export { Checkbox };

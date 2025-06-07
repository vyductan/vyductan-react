import type { XOR } from "ts-xor";
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@acme/ui/lib/utils";
import { Checkbox as ShadcnCheckbox } from "@acme/ui/shadcn/checkbox";

import { Icon } from "../../icons";
import { LoadingIcon } from "../button";

type ShadcnCheckboxProps = React.ComponentProps<typeof ShadcnCheckbox>;

type OwnCheckboxProps = Omit<
  ShadcnCheckboxProps,
  "checked" | "defaultChecked" | "onChange" | "onCheckedChange"
> & {
  loading?: boolean;

  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
};

type CheckboxProps = XOR<OwnCheckboxProps, ShadcnCheckboxProps>;

const Checkbox = (props: CheckboxProps) => {
  const isShadcnCheckbox = !!props.onCheckedChange;
  if (isShadcnCheckbox) {
    return <ShadcnCheckbox {...props} />;
  }

  const {
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
    ...restProps
  } = props as OwnCheckboxProps;

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
            "data-[state=indeterminate]:text-primary-600 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600",
          )}
          onCheckedChange={onChange}
          {...restProps}
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

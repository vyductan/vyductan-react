"use client";

import type * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@acme/ui/lib/utils";

import { LoadingIcon } from "../button/loading-icon";

export type OwnSwitchProps = Omit<
  React.ComponentProps<typeof SwitchPrimitive.Root>,
  "onChange" | "onCheckedChange" | "value"
> & {
  onChange?: (checked: boolean) => void;
  /** Additional class name for the switch container */
  className?: string;
  /** Alias for checked prop */
  value?: boolean;
  /** Size of the switch */
  size?: "small" | "default";
  /** Loading state of switch */
  loading?: boolean;
};

export const Switch = (props: OwnSwitchProps) => {
  const {
    className,
    onChange,
    checked,
    value,
    defaultChecked,
    size = "default",
    loading,
    disabled,
    ...restProps
  } = props;

  // Use value as alias for checked, with value taking precedence
  // If checked or value is provided, use controlled mode
  // Otherwise, use defaultChecked for uncontrolled mode
  const isControlled = value !== undefined || checked !== undefined;
  const isChecked = isControlled ? (value ?? checked ?? false) : undefined;

  const isSmall = size === "small";
  const isDisabled = Boolean(loading) || Boolean(disabled);

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        isSmall ? "h-4 w-7" : "h-[22px] w-11",
        className,
      )}
      checked={isChecked}
      defaultChecked={defaultChecked}
      disabled={isDisabled}
      onCheckedChange={(checked) => {
        onChange?.(checked);
      }}
      {...restProps}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none relative block rounded-full ring-0 transition-transform",
          isSmall ? "size-3" : "size-[18px]",
          isSmall
            ? "data-[state=checked]:translate-x-[14px] data-[state=unchecked]:translate-x-px"
            : "data-[state=checked]:translate-x-[24px] data-[state=unchecked]:translate-x-[2px]",
        )}
      >
        {loading && (
          <div
            className={cn(
              "absolute inset-px flex items-center justify-center opacity-50",
              isSmall ? "size-2.5" : "size-4",
            )}
          >
            <LoadingIcon className="size-full" />
          </div>
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
};

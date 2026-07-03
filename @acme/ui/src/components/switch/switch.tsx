"use client";

import type * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

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
  size?: "small" | "default" | "large";
  /** Loading state of switch */
  loading?: boolean;
};

export const Switch = (properties: OwnSwitchProps) => {
  const {
    className,
    onChange,
    checked,
    value,
    defaultChecked,
    size = "default",
    loading,
    disabled,
    ...restProperties
  } = properties;

  // Use value as alias for checked, with value taking precedence
  // If checked or value is provided, use controlled mode
  // Otherwise, use defaultChecked for uncontrolled mode
  const isControlled = value !== undefined || checked !== undefined;
  const isChecked = isControlled ? (value ?? checked ?? false) : undefined;

  const isDisabled = Boolean(loading) || Boolean(disabled);

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        "data-[size=small]:h-4 data-[size=small]:w-7 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=large]:h-[22px] data-[size=large]:w-11",
        className,
      )}
      checked={isChecked}
      defaultChecked={defaultChecked}
      disabled={isDisabled}
      onCheckedChange={(checked) => {
        onChange?.(checked);
      }}
      {...restProperties}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none relative block rounded-full bg-background ring-0 transition-transform dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground",
          "group-data-[size=small]/switch:size-3 group-data-[size=default]/switch:size-3.5 group-data-[size=large]/switch:size-[18px]",
          "data-[state=unchecked]:translate-x-px group-data-[size=small]/switch:data-[state=checked]:translate-x-[13px] group-data-[size=default]/switch:data-[state=checked]:translate-x-[15px] group-data-[size=large]/switch:data-[state=checked]:translate-x-[23px]",
        )}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center opacity-50">
            <LoadingIcon className="group-data-[size=small]/switch:size-2 group-data-[size=default]/switch:size-2.5 group-data-[size=large]/switch:size-3" />
          </div>
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
};

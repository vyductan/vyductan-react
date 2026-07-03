import type React from "react";
import type { XOR } from "ts-xor";

import type { Switch as ShadcnSwitch } from "@acme/ui/shadcn/switch";

import type { OwnSwitchProps as OwnSwitchProperties } from "./switch";
import { Switch as InternalSwitch } from "./switch";

type ShadcnSwitchProperties = React.ComponentProps<typeof ShadcnSwitch>;

type SwitchProperties = XOR<OwnSwitchProperties, ShadcnSwitchProperties>;

const ConditionSwitch = (properties: SwitchProperties) => {
  // InternalSwitch already renders the correct sizing natively, so both prop
  // styles route to it. Normalize the radix-style API (onCheckedChange, size="sm")
  // onto InternalSwitch's API (onChange, size="small").
  const { onCheckedChange, size, ...restProperties } = properties as
    & Omit<OwnSwitchProperties, "size">
    & {
      onCheckedChange?: (checked: boolean) => void;
      size?: "sm" | "small" | "default" | "large";
    };

  return (
    <InternalSwitch
      {...restProperties}
      size={size === "sm" ? "small" : size}
      onChange={onCheckedChange ?? restProperties.onChange}
    />
  );
};

export { ConditionSwitch as Switch };
export type {
  SwitchProperties as SwitchProps,
  ShadcnSwitchProperties as ShadcnSwitchProps,
};

export { type OwnSwitchProps } from "./switch";

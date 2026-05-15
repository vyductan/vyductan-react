import type React from "react";
import type { XOR } from "ts-xor";

import { cn } from "@acme/ui/lib/utils";
import { Switch as ShadcnSwitch } from "@acme/ui/shadcn/switch";

import type { OwnSwitchProps as OwnSwitchProperties } from "./switch";
import { Switch as InternalSwitch } from "./switch";

type ShadcnSwitchProperties = React.ComponentProps<typeof ShadcnSwitch>;

type SwitchProperties = XOR<OwnSwitchProperties, ShadcnSwitchProperties>;

const ConditionSwitch = (properties: SwitchProperties) => {
  const isShadcnSwitchProperties = properties.onCheckedChange;

  if (isShadcnSwitchProperties) {
    const { className, ...restProperties } = properties;
    return (
      <ShadcnSwitch
        className={cn(
          "h-[22px] w-11",
          "**:data-[slot=switch-thumb]:size-[18px]",
          "**:data-[slot=switch-thumb]:data-[state=unchecked]:translate-x-[2px]!",
          "**:data-[slot=switch-thumb]:data-[state=checked]:translate-x-[24px]!",
          className,
        )}
        {...(restProperties as ShadcnSwitchProperties)}
      />
    );
  }
  return <InternalSwitch {...(properties as OwnSwitchProperties)} />;
};

export { ConditionSwitch as Switch };
export type {
  SwitchProperties as SwitchProps,
  ShadcnSwitchProperties as ShadcnSwitchProps,
};

export { type OwnSwitchProps } from "./switch";

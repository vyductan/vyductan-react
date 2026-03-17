import type React from "react";
import type { XOR } from "ts-xor";

import { cn } from "@acme/ui/lib/utils";
import { Switch as ShadcnSwitch } from "@acme/ui/shadcn/switch";

import type { OwnSwitchProps } from "./switch";
import { Switch as InternalSwitch } from "./switch";

type ShadcnSwitchProps = React.ComponentProps<typeof ShadcnSwitch>;

type SwitchProps = XOR<OwnSwitchProps, ShadcnSwitchProps>;

const ConditionSwitch = (props: SwitchProps) => {
  const isShadcnSwitchProps = props.onCheckedChange;

  if (isShadcnSwitchProps) {
    const { className, ...restProps } = props;
    return (
      <ShadcnSwitch
        className={cn(
          "h-[22px] w-11",
          "**:data-[slot=switch-thumb]:size-[18px]",
          "**:data-[slot=switch-thumb]:data-[state=unchecked]:translate-x-[2px]!",
          "**:data-[slot=switch-thumb]:data-[state=checked]:translate-x-[24px]!",
          className,
        )}
        {...(restProps as ShadcnSwitchProps)}
      />
    );
  }
  return <InternalSwitch {...(props as OwnSwitchProps)} />;
};

export { ConditionSwitch as Switch };
export type { SwitchProps, ShadcnSwitchProps };

export { type OwnSwitchProps } from "./switch";

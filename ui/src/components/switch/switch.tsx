"use client";

import type { XOR } from "ts-xor";
import * as React from "react";

import { cn } from "@acme/ui/lib/utils";

import { Switch as ShadcnSwitch } from "../../shadcn/switch";

type ShadcnSwitchProps = React.ComponentProps<typeof ShadcnSwitch>;
type OwnSwitchProps = Omit<
  ShadcnSwitchProps,
  "onChange" | "onCheckedChange"
> & {
  onChange?: (checked: boolean) => void;
};
type SwitchProps = XOR<OwnSwitchProps, ShadcnSwitchProps>;
const Switch = (props: SwitchProps) => {
  const isShadcnSwitchProps = props.onCheckedChange;

  if (isShadcnSwitchProps) {
    const { className, ...restProps } = props;
    return (
      <ShadcnSwitch
        className={cn(
          "h-[22px] w-11",
          "data-[slot=switch-thumb]:size-[18px]",
          className,
        )}
        {...restProps}
      />
    );
  }

  const { className, onChange, ...restProps } = props as OwnSwitchProps;

  return (
    <ShadcnSwitch
      className={cn(
        "h-[22px] w-11",
        "data-[slot=switch-thumb]:size-[18px]",
        className,
      )}
      onCheckedChange={(checked) => {
        onChange?.(checked);
      }}
      {...restProps}
    />
  );
};

export { Switch };

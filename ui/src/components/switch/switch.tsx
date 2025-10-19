"use client";

import type * as React from "react";
import type { XOR } from "ts-xor";

import { cn } from "@acme/ui/lib/utils";

import { Switch as ShadcnSwitch } from "../../shadcn/switch";

type ShadcnSwitchProps = React.ComponentProps<typeof ShadcnSwitch>;
type OwnSwitchProps = Omit<
  ShadcnSwitchProps,
  "onChange" | "onCheckedChange"
> & {
  onChange?: (checked: boolean) => void;
  /** Content to show when the state is checked */
  checkedChildren?: React.ReactNode;
  /** Content to show when the state is unchecked */
  unCheckedChildren?: React.ReactNode;
  /** Additional class name for the switch container */
  className?: string;
  /** Alias for checked prop */
  value?: boolean;
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

  const {
    className,
    onChange,
    checkedChildren,
    unCheckedChildren,
    checked,
    value,
    ...restProps
  } = props as OwnSwitchProps;

  const hasChildren = checkedChildren ?? unCheckedChildren;
  // Use value as alias for checked, with value taking precedence
  const isChecked = value ?? checked;

  return (
    <ShadcnSwitch
      className={cn(
        !hasChildren && "h-[22px] w-11",
        !hasChildren && "data-[slot=switch-thumb]:size-[18px]",
        hasChildren && "h-6 min-w-11",
        hasChildren && "data-[slot=switch-thumb]:size-5",
        className,
      )}
      checked={isChecked}
      onCheckedChange={(checked) => {
        onChange?.(checked);
      }}
      {...restProps}
    >
      {hasChildren && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center text-xs font-medium whitespace-nowrap",
            "transition-all duration-200 ease-in-out",
            isChecked ? "right-5 left-1.5" : "right-1.5 left-5",
          )}
        >
          {isChecked ? checkedChildren : unCheckedChildren}
        </div>
      )}
    </ShadcnSwitch>
  );
};

export { Switch };

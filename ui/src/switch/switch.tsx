"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "..";

type SwitchProps = Omit<
  React.ComponentProps<typeof SwitchPrimitives.Root>,
  "onChange" | "onCheckedChange"
> & {
  onChange?: (checked: boolean) => void;
};
const Switch = ({ className, onChange, ...props }: SwitchProps) => (
  <SwitchPrimitives.Root
    data-slot="switch"
    className={cn(
      "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 inline-flex shrink-0 items-center rounded-full border-2 border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
      // "h-5 w-9"
      // own
      "h-[22px] w-11",
      className,
    )}
    onCheckedChange={(checked) => {
      onChange?.(checked);
    }}
    {...props}
  >
    <SwitchPrimitives.Thumb
      data-slot="switch-thumb"
      className={cn(
        "bg-background pointer-events-none block rounded-full ring-0 shadow-lg transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        // "size-4"
        // own
        "size-[18px]",
      )}
    />
  </SwitchPrimitives.Root>
);

export { Switch };

"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@acme/ui/lib/utils";

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
      "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
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
        "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        // own
        "size-[18px]",
      )}
    />
  </SwitchPrimitives.Root>
);

export { Switch };

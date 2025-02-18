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
    className={cn(
      "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 inline-flex shrink-0 items-center rounded-full border-2 border-transparent shadow-xs transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-hidden focus-visible:outline-1 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:focus-visible:ring-0",
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
      className={cn(
        "bg-background pointer-events-none block rounded-full ring-0 shadow-lg transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        // own
        "size-[18px]",
      )}
    />
  </SwitchPrimitives.Root>
);

export { Switch };

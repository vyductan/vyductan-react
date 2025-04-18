"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "..";

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & {
  required?: boolean;
};
function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-1 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-600">*</span>}
    </LabelPrimitive.Root>
  );
}

export type { LabelProps };
export { Label };

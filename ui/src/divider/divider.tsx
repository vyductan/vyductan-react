"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "..";

type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root>;
const Separator = ({
  className,
  orientation = "horizontal",
  decorative = true,
  children,
  ...props
}: SeparatorProps) => {
  const separator = (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        orientation === "horizontal" && "my-6",
        orientation === "horizontal" && children && "grow basis-0",
        className,
      )}
      {...props}
    />
  );

  const Comp = children ? (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      {separator}
      <div className="mb-px">{children}</div>
      {separator}
    </div>
  ) : (
    separator
  );
  return Comp;
};

export type { SeparatorProps as DividerProps };
export { Separator as Divider, Separator };

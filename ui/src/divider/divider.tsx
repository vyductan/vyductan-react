"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "..";

type SeparatorProps = React.ComponentPropsWithoutRef<
  typeof SeparatorPrimitive.Root
> & {
  as?: "li";
};
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      as,
      className,
      orientation = "horizontal",
      decorative = true,
      children,
      ...props
    },
    ref,
  ) => {
    const separator = (
      <SeparatorPrimitive.Root
        asChild
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 bg-border",
          orientation === "horizontal" && "my-6 h-px w-full",
          orientation === "horizontal" && children && "grow basis-0",
          orientation === "vertical" && "h-full w-px",
          className,
        )}
        {...props}
      >
        {as === "li" ? <li /> : <div />}
      </SeparatorPrimitive.Root>
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
  },
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator as Divider };

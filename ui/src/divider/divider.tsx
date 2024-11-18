"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "..";
import { GenericSlot } from "../slot";

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
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        )}
        {...props}
      >
        {as === "li" ? <li /> : <div />}
      </SeparatorPrimitive.Root>
    );

    const Comp = children ? (
      <div className="flex items-center justify-between gap-2">
        {separator}
        <div className="mb-px">{children}</div>
        {separator}
      </div>
    ) : (
      separator
    );
    return <GenericSlot className={cn("my-6", className)}>{Comp}</GenericSlot>;
  },
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator as Divider };

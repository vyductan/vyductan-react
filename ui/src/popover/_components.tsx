import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "..";

type PopoverRootProps = React.ComponentProps<typeof PopoverPrimitive.Root>;
function PopoverRoot({ ...props }: PopoverRootProps) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

type PopoverContentProps = React.ComponentProps<
  typeof PopoverPrimitive.Content
>;
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-hidden",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        //   style={{
        //   boxShadow: `0 6px 16px 0 rgba(0, 0, 0, 0.08),
        // 0 3px 6px -4px rgba(0, 0, 0, 0.12),
        // 0 9px 28px 8px rgba(0, 0, 0, 0.05)`,
        // }}
        // to allow scrollable
        onWheel={(event) => {
          event.stopPropagation();
        }}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export type { PopoverRootProps, PopoverContentProps };
export { PopoverRoot, PopoverTrigger, PopoverAnchor, PopoverContent };

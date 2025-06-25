import * as PopoverPrimitive from "@radix-ui/react-popover";

import type { Popover as ShadcnPopover } from "../../shadcn/popover";
import { PopoverContent as ShadcnPopoverContent } from "../../shadcn/popover";

type PopoverRootProps = React.ComponentProps<typeof ShadcnPopover>;

type PopoverContentProps = React.ComponentProps<typeof ShadcnPopoverContent>;
const PopoverContent = ({
  onFocusOutside,
  onWheel,
  ...props
}: PopoverContentProps) => {
  return (
    <ShadcnPopoverContent
      // prevent close panel if open any modal
      onFocusOutside={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onFocusOutside?.(e);
      }}
      // to allow scrollable
      onWheel={(e) => {
        e.preventDefault();
        onWheel?.(e);
      }}
      style={{
        boxShadow: `var(--box-shadow-secondary)`,
      }}
      {...props}
    />
  );
};

const PopoverClose = PopoverPrimitive.Close;

export type { PopoverRootProps, PopoverContentProps };
export { Popover as PopoverRoot, PopoverTrigger } from "../../shadcn/popover";
export { PopoverContent, PopoverClose };

import * as PopoverPrimitive from "@radix-ui/react-popover";

import type { Popover as ShadcnPopover } from "../../shadcn/popover";
import { PopoverContent as ShadcnPopoverContent } from "../../shadcn/popover";

type PopoverRootProps = React.ComponentProps<typeof ShadcnPopover>;

type PopoverContentProps = React.ComponentProps<typeof ShadcnPopoverContent>;
const PopoverContent = ({
  onFocusOutside,
  onWheel,
  onTouchMove,
  ...props
}: PopoverContentProps) => {
  return (
    <ShadcnPopoverContent
      style={{
        boxShadow: `var(--box-shadow-secondary)`,
      }}
      // prevent close panel if open any modal
      onFocusOutside={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onFocusOutside?.(e);
      }}
      // Fix scrollable https://github.com/shadcn-ui/ui/issues/542#issuecomment-3077844347
      onWheel={(e) => {
        e.stopPropagation();
        onWheel?.(e);
      }}
      onTouchMove={(e) => {
        e.stopPropagation();
        onTouchMove?.(e);
      }}
      {...props}
    />
  );
};

const PopoverClose = PopoverPrimitive.Close;

export type { PopoverRootProps, PopoverContentProps };
export { Popover as PopoverRoot, PopoverTrigger } from "../../shadcn/popover";
export { PopoverContent, PopoverClose };

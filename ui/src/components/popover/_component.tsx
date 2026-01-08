import * as PopoverPrimitive from "@radix-ui/react-popover";

import type {
  Popover as ShadcnPopover,
  PopoverContent as ShadcnPopoverContent,
} from "@acme/ui/shadcn/popover";
import { cn } from "@acme/ui/lib/utils";

type PopoverRootProps = React.ComponentProps<typeof ShadcnPopover>;

type PopoverContentProps = React.ComponentProps<typeof ShadcnPopoverContent> & {
  container?: HTMLElement | null;
};
const PopoverContent = ({
  container,

  style,
  className,
  align,
  sideOffset,

  onFocusOutside,
  onWheel,
  onTouchMove,
  ...props
}: PopoverContentProps) => {
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        style={{
          boxShadow: `var(--box-shadow-secondary)`,
          ...style,
        }}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden max-sm:p-2",
          className,
        )}
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
    </PopoverPrimitive.Portal>
  );
};

const PopoverClose = PopoverPrimitive.Close;

export type { PopoverRootProps, PopoverContentProps };
export {
  Popover as PopoverRoot,
  PopoverTrigger,
  PopoverAnchor,
} from "@acme/ui/shadcn/popover";
export { PopoverContent, PopoverClose };

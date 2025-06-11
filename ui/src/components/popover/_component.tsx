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
      //   style={{
      //   boxShadow: `0 6px 16px 0 rgba(0, 0, 0, 0.08),
      // 0 3px 6px -4px rgba(0, 0, 0, 0.12),
      // 0 9px 28px 8px rgba(0, 0, 0, 0.05)`,
      // }}
      {...props}
    />
  );
};

export type { PopoverRootProps, PopoverContentProps };
export { Popover as PopoverRoot, PopoverTrigger } from "../../shadcn/popover";
export { PopoverContent };

import { Tooltip as TooltipPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  arrow = true,
  classNames,
  styles,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  /**
   * Render the arrow. Pass `false` to drop it — a `hidden` class can't, since
   * Radix sets an inline `display: block` on the arrow's svg.
   */
  arrow?: boolean;
  classNames?: {
    arrow?: string;
  };
  styles?: {
    arrow?: React.CSSProperties;
  };
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-primary px-3 py-1.5 text-xs text-balance text-primary-foreground fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "bg-foreground text-background",
          className,
        )}
        {...props}
      >
        {children}
        {arrow && (
          <TooltipPrimitive.Arrow
            data-slot="tooltip-arrow"
            className={cn(
              "z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-primary fill-primary",
              "bg-foreground fill-foreground",
              classNames?.arrow,
            )}
            style={styles?.arrow}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export {
  TooltipProvider,
  Tooltip as TooltipRoot,
  TooltipTrigger,
} from "../../shadcn/tooltip";

export { TooltipContent };

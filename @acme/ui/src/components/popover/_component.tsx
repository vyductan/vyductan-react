import React from "react";

import { Popover as PopoverPrimitive } from "radix-ui";

import type {
  Popover as ShadcnPopover,
  PopoverContent as ShadcnPopoverContent,
} from "@acme/ui/shadcn/popover";
import { cn } from "@acme/ui/lib/utils";
import { hasModalLayerAfter } from "@acme/ui/lib/modal-layers";

type PopoverRootProps = React.ComponentProps<typeof ShadcnPopover>;

type PopoverContentProps = React.ComponentProps<typeof ShadcnPopoverContent> & {
  container?: HTMLElement | null;
};
const PopoverContent = ({
  container,

  style,
  className,
  align = "center",
  sideOffset = 4,

  ref,
  onFocusOutside,
  onPointerDownOutside,
  onEscapeKeyDown,
  onWheel,
  onTouchMove,
  forceMount,
  ...props
}: PopoverContentProps) => {
  // Needed to ask "is a modal layer stacked above ME?" — see the guard below.
  const contentReference = React.useRef<HTMLDivElement>(null);

  return (
    <PopoverPrimitive.Portal container={container} forceMount={forceMount}>
      <PopoverPrimitive.Content
        ref={(node) => {
          contentReference.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        style={{
          boxShadow: `var(--box-shadow-secondary)`,
          ...style,
        }}
        className={cn(
          // `pointer-events-auto`: when this content is portaled to <body> while
          // a modal layer (e.g. a vaul Drawer / Radix Dialog) has locked the
          // page with `body { pointer-events: none }`, pointer-events would
          // otherwise be inherited as `none` and the popover becomes
          // click-through (clicks fall to the layer behind, dismissing it).
          // Forcing `auto` here keeps the popover interactive in that case and
          // is a no-op when the body is not locked.
          // `select-text`: guarantee the popover text stays selectable/copyable
          // inside modal contexts that otherwise disable selection.
          "pointer-events-auto select-text",
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden max-sm:p-2",
          className,
        )}
        // prevent close panel if open any modal
        onFocusOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFocusOutside?.(e);
        }}
        // A Drawer/Dialog opened ON TOP of this popover lives in its own
        // DismissableLayer stack, so every click that layer handles — filling
        // its form, or clicking its mask to dismiss it — also lands here as an
        // outside pointer-down and takes the popover down with it. Radix only
        // dismisses when the event is not default-prevented (see
        // react-dismissable-layer: `if (!event.defaultPrevented) onDismiss?.()`),
        // so vetoing here parks the popover behind the layer and leaves it
        // standing once the layer is gone.
        //
        // NOT gated on Escape: preventDefault on that keydown would carry
        // `defaultPrevented` across to the layer above and stop IT from
        // closing — the same trap documented in the Drawer.
        // Escape belongs to the layer above. Vetoing here keeps the popover
        // parked; the Drawer takes Escape in a capture-phase listener of its
        // own precisely because this veto marks the keydown default-prevented,
        // which Radix's own escape path reads as already-handled.
        onEscapeKeyDown={(e) => {
          // Single decision point, and it is per-NODE: whether THIS popover is
          // parked behind a modal layer. Swallowing the callback (rather than
          // letting the consumer read `e.defaultPrevented`) is the whole point —
          // that flag is shared by every layer resolving the same keydown, so a
          // Drawer standing down for a sibling popover would otherwise silence
          // this one's self-close too.
          if (hasModalLayerAfter(contentReference.current, e)) {
            e.preventDefault();
            return;
          }
          onEscapeKeyDown?.(e);
        }}
        onPointerDownOutside={(e) => {
          // Pass the originating pointer-down: the layer above resolves this
          // same event and flips its own `data-state` while doing so, so the
          // answer has to come from the pre-dismiss snapshot keyed on it.
          if (hasModalLayerAfter(contentReference.current, e.detail.originalEvent)) {
            e.preventDefault();
          }
          onPointerDownOutside?.(e);
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
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@acme/ui/shadcn/popover";
export { PopoverContent, PopoverClose };

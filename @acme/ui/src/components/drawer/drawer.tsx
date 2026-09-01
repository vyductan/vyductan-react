import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@acme/ui/lib/utils";

import type {
  DrawerPlacement,
  DrawerResizableConfig,
  DrawerSize,
} from "./types";

import { Icon } from "../../icons";
import { Button } from "../button";
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
  hasOpenDialogAbove,
} from "./_components";
import { registerEscapeTarget } from "../../lib/modal-layers";
import {
  clampDrawerSize,
  isHorizontalPlacement,
  resizeDelta,
  resolveDrawerSize,
} from "./resize";

type ShadcnDrawerProperties = React.ComponentProps<typeof DrawerRoot>;
type DrawerProperties = ShadcnDrawerProperties & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  extra?: React.ReactNode;
  trigger?: React.ReactNode;
  footer?: React.ReactNode;

  className?: string;
  classNames?: {
    header?: string;
    title?: string;
    description?: string;
    content?: string;
    footer?: string;
  };
  placement?: DrawerPlacement;
  /**
   * Called when the Drawer is dismissed by the user (close icon, Escape,
   * outside click, drag). Not called when the parent flips `open` itself.
   *
   * Declared here — and NOT forwarded to vaul — on purpose: vaul fires its own
   * `onClose` from inside `closeDrawer()`, before the open state (and so
   * `onOpenChange`) is touched, which would bypass the stacked-dialog guard
   * below. Routing it through `handleOpenChange` keeps both callbacks gated.
   */
  onClose?: () => void;
  /**
   * Size of the Drawer along the axis picked by `placement`: width for
   * `left`/`right`, height for `top`/`bottom`. Number is treated as px;
   * strings pass through as CSS lengths (`'50%'`, `'20vw'`).
   */
  size?: DrawerSize;
  /**
   * @deprecated Use `size` — it also covers `top`/`bottom` placements, where a
   * width does nothing. Kept working as a fallback for existing call sites.
   */
  width?: string | number;
  /**
   * Let the user drag the Drawer's inner edge to resize it. Pass an object to
   * hook the drag lifecycle.
   *
   * Only honored on the standard (non-composable) Drawer — the composable form
   * renders its own `DrawerContent`, which is where the grip lives.
   */
  resizable?: boolean | DrawerResizableConfig;
  /**
   * Largest size a drag may reach, in px. Follows AntD: a drag-only clamp, so
   * a `size` set larger than this is left alone.
   */
  maxSize?: number;
  closeIcon?: React.ReactNode;
};
const Drawer = ({
  title,
  description,
  children,
  extra,
  trigger,
  footer,
  className,
  classNames,
  placement = "right",
  size,
  width,
  resizable,
  maxSize,
  closeIcon,
  onClose,
  onOpenChange,
  ...properties
}: DrawerProperties) => {
  // A vaul Drawer dismisses on its own Escape / outside-click, but it lives in
  // a DismissableLayer stack separate from the app's radix-ui Modal/AlertModal.
  // When a Radix dialog is stacked on top, that dialog handles its own close —
  // so ignore the drawer's close request to stop the whole stack collapsing.
  // Done here (not via preventDefault on the Escape event) so the keypress
  // stays un-prevented and the stacked dialog can still close itself.
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && hasOpenDialogAbove()) return;
      if (!open) onClose?.();
      onOpenChange?.(open);
    },
    [onClose, onOpenChange],
  );

  const contentReference = useRef<HTMLDivElement>(null);

  // Claim Escape while open. This replaces a bespoke capture listener: the
  // shared registry picks the topmost OPEN layer, so a Select or Popover above
  // the drawer wins without the drawer having to reason about it, and a closed
  // layer lingering on its way out cannot swallow the key.
  useEffect(
    () =>
      registerEscapeTarget(
        () => contentReference.current,
        () => handleOpenChange(false),
      ),
    [handleOpenChange],
  );

  const [draggedSize, setDraggedSize] = useState<number>();
  const isHorizontal = isHorizontalPlacement(placement);
  const resizeHandlers: DrawerResizableConfig | undefined =
    typeof resizable === "object" ? resizable : undefined;

  // Measure the live panel rather than parsing `size` — it may be a percentage
  // or viewport unit, and after the first drag the truth is the DOM anyway.
  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const panel = contentReference.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const startSize = isHorizontal ? rect.width : rect.height;
    const { clientX, clientY } = event;

    event.preventDefault();
    resizeHandlers?.onResizeStart?.();
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const onPointerMove = (move: PointerEvent) => {
      const next = clampDrawerSize(
        startSize +
          resizeDelta(placement, move.clientX - clientX, move.clientY - clientY),
        maxSize,
      );
      setDraggedSize(next);
      resizeHandlers?.onResize?.(next);
    };
    const onPointerUp = () => {
      globalThis.removeEventListener("pointermove", onPointerMove);
      document.body.style.userSelect = previousUserSelect;
      resizeHandlers?.onResizeEnd?.();
    };

    globalThis.addEventListener("pointermove", onPointerMove);
    globalThis.addEventListener("pointerup", onPointerUp, { once: true });
  };

  // Keyboard path for the grip: a pointer-only resize is unreachable without a
  // pointing device.
  const nudgeResize = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const grow = isHorizontal ? "ArrowLeft" : "ArrowUp";
    const shrink = isHorizontal ? "ArrowRight" : "ArrowDown";
    if (event.key !== grow && event.key !== shrink) return;
    const panel = contentReference.current;
    if (!panel) return;

    event.preventDefault();
    const rect = panel.getBoundingClientRect();
    const current = isHorizontal ? rect.width : rect.height;
    const step = event.shiftKey ? 64 : 16;
    const delta = resizeDelta(
      placement,
      event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0,
      event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0,
    );
    const next = clampDrawerSize(current + delta, maxSize);
    setDraggedSize(next);
    resizeHandlers?.onResize?.(next);
  };

  const isShadcnDrawer = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === DrawerContent,
  );
  if (isShadcnDrawer)
    return (
      <DrawerRoot
        direction={placement}
        onOpenChange={handleOpenChange}
        {...properties}
      >
        {children}
      </DrawerRoot>
    );

  return (
    <DrawerRoot
      direction={placement}
      handleOnly
      onOpenChange={handleOpenChange}
      {...properties}
    >
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent
        ref={contentReference}
        style={
          {
            "--drawer-size":
              draggedSize === undefined
                ? resolveDrawerSize(size ?? width)
                : `${draggedSize}px`,
          } as React.CSSProperties
        }
        className={cn(
          isHorizontal ? "w-(--drawer-size)" : "h-(--drawer-size)",
          className,
        )}
      >
        {resizable && (
          <div
            data-slot="drawer-resize-handle"
            // vaul reads this to leave the gesture alone — without it a drag on
            // the grip is a swipe-to-dismiss on the composable Drawer, which
            // does not set `handleOnly`.
            data-vaul-no-drag
            role="separator"
            aria-label="Resize drawer"
            aria-orientation={isHorizontal ? "vertical" : "horizontal"}
            tabIndex={0}
            onPointerDown={startResize}
            onKeyDown={nudgeResize}
            // The element itself is the hit area — 10px, since a hairline is an
            // unusable target even with a mouse. The hairline people SEE is the
            // ::before, pinned to the panel edge. The hit area grows inward
            // only: straddling the edge would eat clicks meant for the mask.
            className={cn(
              "absolute z-10 touch-none",
              // Resize is a pointer affordance: even at 10px the grip is well
              // under a 44px touch target, and on a bottom drawer it sits on
              // the same edge as vaul's drag-to-dismiss handle. Gate on
              // `any-pointer: fine` rather than `pointer: coarse` so a tablet
              // with a trackpad attached still gets it — only devices with no
              // fine pointer at all lose it.
              "not-any-pointer-fine:hidden",
              "focus-visible:outline-hidden",
              "before:bg-primary/40 before:absolute before:opacity-0 before:transition-opacity before:content-['']",
              "hover:before:opacity-100 focus-visible:before:opacity-100",
              isHorizontal
                ? "inset-y-0 w-2.5 cursor-col-resize before:inset-y-0 before:w-0.5"
                : "inset-x-0 h-2.5 cursor-row-resize before:inset-x-0 before:h-0.5",
              placement === "right" && "left-0 before:left-0",
              placement === "left" && "right-0 before:right-0",
              placement === "bottom" && "top-0 before:top-0",
              placement === "top" && "bottom-0 before:bottom-0",
            )}
          />
        )}
        <div className="flex flex-1 flex-col overflow-hidden">
          <DrawerHeader className={cn(classNames?.header)}>
            <div className="flex flex-1 flex-row items-start gap-2">
              {closeIcon === false ? undefined : (
                <Button variant="text" shape="icon" asChild>
                  <DrawerClose
                    className={cn(
                      // "mt-1 self-start",
                      // "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400",
                      "rounded-xs opacity-70 transition-opacity",
                      "ring-offset-background focus:ring-ring",
                      "hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none",
                      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                      "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
                      // "absolute top-4 right-4"
                    )}
                  >
                    {closeIcon ?? (
                      <Icon icon="icon-[lucide--x]" className="size-5" />
                    )}
                    <span className="sr-only">Close</span>
                  </DrawerClose>
                </Button>
              )}
              <div
                data-slot="drawer-header-content"
                className="flex flex-1 flex-col"
              >
                <DrawerTitle
                  className={cn("leading-[32px]", classNames?.title)}
                >
                  {title}
                </DrawerTitle>
                <DrawerDescription
                  className={cn(
                    description ? "" : "hidden",
                    classNames?.description,
                  )}
                >
                  {description}
                </DrawerDescription>
              </div>
              <div data-slot="drawer-header-extra">{extra}</div>
            </div>
          </DrawerHeader>

          <div className={cn("flex-1 overflow-auto p-6", classNames?.content)}>
            {children}
          </div>

          {footer && (
            <DrawerFooter className={classNames?.footer}>{footer}</DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </DrawerRoot>
  );
};

export type { DrawerProperties as DrawerProps };
export { Drawer };

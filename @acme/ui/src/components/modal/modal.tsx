"use client";

import * as React from "react";

import type { ButtonProps } from "@acme/ui/components/button";
import { Button } from "@acme/ui/components/button";
import { cn } from "@acme/ui/lib/utils";

import type { Breakpoint } from "../_util/responsive-observer";
import { ScrollArea } from "../scroll-area";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./_components";

type ModalProperties = React.ComponentProps<typeof Dialog> & {
  /** Width of the modal dialog */
  width?: string | number | Partial<Record<Breakpoint, string | number>>;
  className?: string;
  classNames?: {
    header?: string;
    title?: string;
    description?: string;
    footer?: string;
  };
  children?: React.ReactNode;
  description?: React.ReactNode;
  footer?:
    | ((parameters: {
        originNode: React.ReactNode;
        extra: {
          OkBtn: React.ReactElement<ButtonProps>;
          CancelBtn: React.ReactElement<ButtonProps>;
        };
      }) => React.ReactNode)
    | React.ReactNode;
  okText?: string;
  okType?: "default" | "primary" | "danger";
  confirmLoading?: boolean;
  okButtonProps?: ButtonProps;
  cancelText?: string;
  title?: React.ReactNode;
  trigger?: React.ReactNode;
  onOk?: React.MouseEventHandler<HTMLButtonElement>;
  onCancel?: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};
const Modal = ({
  width,
  className,
  classNames,
  children,
  description,
  footer,
  okText,
  okType,
  confirmLoading,
  okButtonProps,
  title,
  trigger,
  onOk,
  onCancel,
  cancelText,
  // onOpenChange,
  //
  ...rest
}: ModalProperties) => {
  // =========================== Width ============================
  // The dialog is capped with `sm:max-w-(--modal-width)`, and an `sm:` utility
  // outranks an unprefixed one at every width >= 640px. So a caller writing
  // `className="max-w-5xl"` gets the class into the DOM and no wider dialog —
  // it silently loses to the 520px default. When the caller sizes the dialog
  // themselves and passes no `width`, stand down and let their class govern.
  // An explicit `width` still wins over a caller class: the prop is the more
  // specific instruction of the two.
  const callerCapsWidth = /(^|\s)max-w-/.test(className ?? "");
  const resolvedWidth = width ?? (callerCapsWidth ? undefined : 520);

  const [numberWidth, responsiveWidth] = React.useMemo<
    [
      string | number | undefined,
      Partial<Record<Breakpoint, string | number>> | undefined,
    ]
  >(() => {
    if (resolvedWidth && typeof resolvedWidth === "object") {
      return [undefined, resolvedWidth];
    }
    return [resolvedWidth, undefined];
  }, [resolvedWidth]);

  const responsiveWidthVariables = React.useMemo(() => {
    const variables: Record<string, string> = {};
    if (responsiveWidth) {
      for (const breakpoint of Object.keys(responsiveWidth)) {
        const breakpointWidth = responsiveWidth[breakpoint as Breakpoint];
        if (breakpointWidth !== undefined) {
          variables[`--modal-${breakpoint}-width`] =
            typeof breakpointWidth === "number"
              ? `${breakpointWidth}px`
              : breakpointWidth;
        }
      }
    }
    return variables;
  }, [responsiveWidth]);

  // ponytail: scroll affordance — a soft edge gradient on the side of the
  // scroll body that has more content, so a long body reads as scrollable (the
  // thin Radix scrollbar is easy to miss). The gradients are OVERLAY nodes so
  // they paint ON TOP of the content — an inset box-shadow paints under it and
  // gets covered by any opaque row (e.g. a highlighted total). Presence of the
  // data-scroll-up / data-scroll-down attrs (toggled here) drives their opacity.
  //
  // A callback ref (not useEffect) is required: Radix's Portal mounts the dialog
  // body one render LATER than the Modal commits, so a useEffect would run
  // before the viewport exists and never see it. The callback ref fires exactly
  // when the wrapper — and the Radix viewport inside it — actually mount.
  const affordanceCleanup = React.useRef<(() => void) | null>(null);
  const scrollRef = React.useCallback((root: HTMLDivElement | null) => {
    affordanceCleanup.current?.();
    affordanceCleanup.current = null;
    const viewport = root?.querySelector<HTMLElement>(
      "[data-radix-scroll-area-viewport]",
    );
    if (!root || !viewport) return;
    const update = () => {
      root.toggleAttribute("data-scroll-up", viewport.scrollTop > 1);
      root.toggleAttribute(
        "data-scroll-down",
        viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1,
      );
    };
    update();
    viewport.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    if (viewport.firstElementChild)
      observer.observe(viewport.firstElementChild);
    affordanceCleanup.current = () => {
      viewport.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  // const CancelBtn = () => (
  //   <DialogClose asChild onClick={onCancel}>
  //     <Button variant="outlined">Cancel</Button>
  //   </DialogClose>
  // );
  // const OkBtn = useMemo(
  //   () => () => (
  //     <Button loading={confirmLoading} onClick={onOk}>
  //       {okText ?? "Ok"}
  //     </Button>
  //   ),
  //   [confirmLoading, okText, onOk],
  // );
  const footerToRender =
    footer === undefined ? (
      <>
        {/* <CancelBtn /> */}
        <DialogClose asChild onClick={onCancel}>
          <Button variant="outlined">{cancelText ?? "Cancel"}</Button>
        </DialogClose>
        <Button
          type="primary"
          loading={confirmLoading}
          onClick={onOk}
          {...(okType === "danger" ? { color: "danger" } : {})}
          {...okButtonProps}
        >
          {okText ?? "Ok"}
        </Button>
      </>
    ) : typeof footer === "function" ? (
      footer({
        originNode: undefined,
        extra: {
          OkBtn: (
            <Button
              type="primary"
              loading={confirmLoading}
              onClick={onOk}
              {...okButtonProps}
            >
              {okText ?? "Ok"}
            </Button>
          ),
          CancelBtn: (
            <DialogClose asChild onClick={onCancel}>
              <Button variant="outlined">{cancelText ?? "Cancel"}</Button>
            </DialogClose>
          ),
        },
      })
    ) : (
      footer
    );

  // ??
  // const ref = React.useRef<HTMLDivElement>(null);
  // ref.current?.scrollTo(0, ref.current.scrollHeight);
  return (
    <Dialog
      {...rest}
      onOpenChange={(isOpen) => {
        rest.onOpenChange?.(isOpen);
        if (!isOpen) {
          onCancel?.();
        }
      }}
    >
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : undefined}

      <DialogContent
        className={cn(
          "px-0 text-sm select-text",
          numberWidth && ["w-(--modal-width)", "sm:max-w-(--modal-width)"],
          // DialogContent's own `max-w-[calc(100%-2rem)]` phone gutter is a
          // base utility, so a caller's base `max-w-*` replaces it outright.
          // Re-state it under `max-sm:` — a different variant group, so it
          // survives alongside their class and still wins below 640px.
          callerCapsWidth && "max-sm:max-w-[calc(100%-2rem)]",
          className,
        )}
        style={{
          ...(numberWidth &&
            ({
              "--modal-width":
                typeof numberWidth === "number"
                  ? `${numberWidth}px`
                  : numberWidth,
            } as React.CSSProperties)),
          ...responsiveWidthVariables,
        }}
      >
        <DialogHeader className={cn("px-6", classNames?.header)}>
          <DialogTitle className={classNames?.title}>{title}</DialogTitle>
          <DialogDescription
            className={cn(!description && "hidden", classNames?.description)}
            asChild={
              React.isValidElement(description) &&
              description.type !== React.Fragment
            }
          >
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Scroll-affordance wrapper: caps the body height and hosts the edge
            gradients (absolute, on top of the scrolling content). */}
        <div
          ref={scrollRef}
          className="group/scroll relative max-h-[80vh] min-h-0"
        >
          <ScrollArea
            className={cn(
              // `h-full` is load-bearing: Radix's ScrollArea.Root doesn't clip
              // (it only sets position:relative), the Viewport does — and the
              // Viewport is sized `size-full`, a percentage that resolves to
              // `auto` unless its parent has a DEFINITE height. With only
              // max-h-[80vh] here the Root stays height:auto, the Viewport grows
              // to the full content height, nothing scrolls, and tall content
              // (e.g. a rich-text Editor) paints outside the dialog box.
              "h-full max-h-[80vh] px-5 *:data-radix-scroll-area-viewport:px-1 max-sm:px-2 [&>[data-radix-scroll-area-viewport]>div]:block!",
              // A couple of px of slack at the bottom of the scrollable
              // viewport. Without it, short content whose `scrollHeight` comes
              // out 1-2px taller than its `clientHeight` — line-box metrics of
              // text/inputs can exceed their own bounding-rect height by that
              // much, a browser quirk with no CSS fix at the text level — reads
              // as "this content overflows" and Radix shows a sliver of
              // scrollbar for a modal that has nothing to scroll. Measured on
              // the End Job modal (label + DatePicker): clientHeight 52 vs
              // scrollHeight 54, and on hover a thumb 48 of 52px tall. The
              // buffer takes it to 56/56 and the scrollbar stops mounting; for
              // content genuinely taller than max-h-[80vh] the 4px is
              // negligible. Keep BOTH this and `h-full` — dropping `h-full`
              // also hides the sliver, but only by breaking scrolling outright.
              "*:data-radix-scroll-area-viewport:pb-1",
            )}
          >
            {children}
          </ScrollArea>
          <div
            aria-hidden
            className="from-foreground/20 pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-150 group-data-[scroll-up]/scroll:opacity-100"
          />
          <div
            aria-hidden
            className="from-foreground/20 pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-150 group-data-[scroll-down]/scroll:opacity-100"
          />
        </div>

        <DialogFooter className={cn("px-6", classNames?.footer)}>
          {footerToRender}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export { Modal };

export { type ModalProperties as ModalProps };

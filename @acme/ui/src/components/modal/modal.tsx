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
  width = 520,
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
  const [numberWidth, responsiveWidth] = React.useMemo<
    [
      string | number | undefined,
      Partial<Record<Breakpoint, string | number>> | undefined,
    ]
  >(() => {
    if (width && typeof width === "object") {
      return [undefined, width];
    }
    return [width, undefined];
  }, [width]);

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
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
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
          <ScrollArea className="h-full max-h-[80vh] px-5 *:data-radix-scroll-area-viewport:px-1 max-sm:px-2 [&>[data-radix-scroll-area-viewport]>div]:block!">
            {children}
          </ScrollArea>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-foreground/20 to-transparent opacity-0 transition-opacity duration-150 group-data-[scroll-up]/scroll:opacity-100"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity duration-150 group-data-[scroll-down]/scroll:opacity-100"
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

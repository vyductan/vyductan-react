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

type ModalProps = React.ComponentProps<typeof Dialog> & {
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
    | ((params: {
        originNode: React.ReactNode;
        extra: {
          OkBtn: React.ReactElement<any>;
          CancelBtn: React.ReactElement<any>;
        };
      }) => React.ReactNode)
    | React.ReactNode;
  okText?: string;
  confirmLoading?: boolean;
  okButtonProps?: ButtonProps;
  cancelText?: string;
  title: React.ReactNode;
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
}: ModalProps) => {
  // =========================== Width ============================
  const [numWidth, responsiveWidth] = React.useMemo<
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

  const responsiveWidthVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    if (responsiveWidth) {
      for (const breakpoint of Object.keys(responsiveWidth)) {
        const breakpointWidth = responsiveWidth[breakpoint as Breakpoint];
        if (breakpointWidth !== undefined) {
          vars[`--modal-${breakpoint}-width`] =
            typeof breakpointWidth === "number"
              ? `${breakpointWidth}px`
              : breakpointWidth;
        }
      }
    }
    return vars;
  }, [responsiveWidth]);

  // const CancelBtn = () => (
  //   <DialogClose asChild onClick={onCancel}>
  //     <Button variant="outline">Cancel</Button>
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
  const footerToRender = footer ? (
    typeof footer === "function" ? (
      footer({
        originNode: undefined,
        extra: {
          OkBtn: (
            <Button loading={confirmLoading} onClick={onOk} {...okButtonProps}>
              {okText ?? "Ok"}
            </Button>
          ),
          CancelBtn: (
            <DialogClose asChild onClick={onCancel}>
              <Button variant="outline">{cancelText ?? "Cancel"}</Button>
            </DialogClose>
          ),
        },
      })
    ) : (
      footer
    )
  ) : (
    <>
      {/* <CancelBtn /> */}
      <DialogClose asChild onClick={onCancel}>
        <Button variant="outline">{cancelText ?? "Cancel"}</Button>
      </DialogClose>
      <Button loading={confirmLoading} onClick={onOk} {...okButtonProps}>
        {okText ?? "Ok"}
      </Button>
    </>
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
        className={cn("px-0", className)}
        style={{
          ...(numWidth &&
            ({
              "--modal-width":
                typeof numWidth === "number" ? `${numWidth}px` : numWidth,
            } as React.CSSProperties)),
          ...responsiveWidthVars,
        }}
      >
        <DialogHeader className={cn("px-6", classNames?.header)}>
          <DialogTitle className={classNames?.title}>{title}</DialogTitle>
          <DialogDescription className={classNames?.description}>
            {description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] px-5 *:data-radix-scroll-area-viewport:px-1 [&>[data-radix-scroll-area-viewport]>div]:block!">
          {children}
        </ScrollArea>

        <DialogFooter className={cn("px-6", classNames?.footer)}>
          {footerToRender}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export { Modal };

export { type ModalProps };

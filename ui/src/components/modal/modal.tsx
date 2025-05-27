"use client";

import * as React from "react";

import type { ButtonProps } from "@acme/ui/components/button";
import { Button } from "@acme/ui/components/button";
import { cn } from "@acme/ui/lib/utils";

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
  okLoading?: boolean;
  okButtonProps?: ButtonProps;
  cancelText?: string;
  title: React.ReactNode;
  trigger?: React.ReactNode;
  onOk?: React.MouseEventHandler<HTMLButtonElement>;
  onCancel?: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};
const Modal = ({
  className,
  classNames,
  children,
  description,
  footer,
  okText,
  okLoading,
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
  const isShadcnDialog = React.Children.toArray(children).some((child) => {
    if (React.isValidElement(child)) {
      const type =
        typeof child.type === "string" ? child.type : child.type.name;
      return type === "DialogContent";
    }
    return false;
  });
  if (isShadcnDialog) {
    return <Dialog {...rest}>{children}</Dialog>;
  }
  // const CancelBtn = () => (
  //   <DialogClose asChild onClick={onCancel}>
  //     <Button variant="outline">Cancel</Button>
  //   </DialogClose>
  // );
  // const OkBtn = useMemo(
  //   () => () => (
  //     <Button loading={okLoading} onClick={onOk}>
  //       {okText ?? "Ok"}
  //     </Button>
  //   ),
  //   [okLoading, okText, onOk],
  // );
  const footerToRender = footer ? (
    typeof footer === "function" ? (
      footer({
        originNode: undefined,
        extra: {
          OkBtn: (
            <Button loading={okLoading} onClick={onOk} {...okButtonProps}>
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
      <Button loading={okLoading} onClick={onOk} {...okButtonProps}>
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

      <DialogContent className={cn("px-0", className)}>
        <DialogHeader className={classNames?.header}>
          <DialogTitle className={classNames?.title}>{title}</DialogTitle>
          <DialogDescription className={classNames?.description}>
            {description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] px-5 *:data-radix-scroll-area-viewport:px-1 [&>[data-radix-scroll-area-viewport]>div]:block!">
          {children}
        </ScrollArea>

        <DialogFooter className={classNames?.footer}>
          {footerToRender}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export { Modal };

export { type ModalProps };

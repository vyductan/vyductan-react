"use client";

import * as React from "react";

import type { DialogProps } from "./_components";
import { Button } from "../button";
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

type ModalProps = DialogProps & {
  className?: string;
  children?: React.ReactNode;
  description?: React.ReactNode;
  footer?:
    | ((params: {
        originNode: React.ReactNode;
        extra: { OkBtn: React.FC; CancelBtn: React.FC };
      }) => React.ReactNode)
    | React.ReactNode;
  okText?: string;
  okLoading?: boolean;
  title: React.ReactNode;
  trigger?: React.ReactNode;
  onOk?: React.MouseEventHandler<HTMLButtonElement>;
  onCancel?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};
const Modal = ({
  className,
  children,
  description,
  footer,
  okText,
  okLoading,
  title,
  trigger,
  onOk,
  onCancel,
  // onOpenChange,
  ...rest
}: ModalProps) => {
  // const CancelBtn = () => (
  //   <DialogClose asChild onClick={onCancel}>
  //     <Button variant="outline">Hủy</Button>
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
  const footerToRender = !footer ? (
    <>
      {/* <CancelBtn /> */}
      <DialogClose asChild onClick={onCancel}>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button loading={okLoading} onClick={onOk}>
        {okText ?? "Ok"}
      </Button>
    </>
  ) : typeof footer === "function" ? (
    footer({
      originNode: null,
      extra: {
        OkBtn: () => (
          <Button loading={okLoading} onClick={onOk}>
            {okText ?? "Ok"}
          </Button>
        ),
        CancelBtn: () => (
          <DialogClose asChild onClick={onCancel}>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        ),
      },
    })
  ) : (
    footer
  );
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
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] px-5 [&>[data-radix-scroll-area-viewport]]:px-1">
          {children}
        </ScrollArea>

        <DialogFooter>{footerToRender}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export { Modal };

export { type ModalProps };

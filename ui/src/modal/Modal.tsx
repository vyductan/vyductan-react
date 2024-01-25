"use client";

import * as React from "react";

import type { DialogProps } from "./components";
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
} from "./components";

type ModalProps = DialogProps & {
  className?: string;
  children?: React.ReactNode;
  description?: React.ReactNode;
  okText?: string;
  okLoading?: boolean;
  title?: React.ReactNode;
  trigger?: React.ReactNode;
  onOk?: React.MouseEventHandler<HTMLButtonElement>;
  onCancel?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};
const Modal = ({
  className,
  children,
  description,
  okText,
  okLoading,
  title,
  trigger,
  onOk,
  onCancel,
  onOpenChange,
  ...rest
}: ModalProps) => {
  return (
    <Dialog
      onOpenChange={(isOpen) => {
        onOpenChange?.(isOpen);
        if (!isOpen) {
          onCancel?.();
        }
      }}
      {...rest}
    >
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent className={className}>
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] px-5 [&>[data-radix-scroll-area-viewport]]:px-1">
          {children}
        </ScrollArea>

        <DialogFooter>
          <DialogClose asChild onClick={onCancel}>
            <Button>Cancel</Button>
          </DialogClose>
          <Button variant="primary" loading={okLoading} onClick={onOk}>
            {okText ?? "Ok"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export { Modal };

export { type ModalProps };

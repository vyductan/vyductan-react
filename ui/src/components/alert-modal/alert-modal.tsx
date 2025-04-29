import React from "react";

import type { ModalProps } from "../modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./_components";

export type AlertModalProps = Omit<ModalProps, "onOk"> & {
  onConfirm?: () => void;
};

export const AlertModal = ({
  className,
  description,
  okText = "Confirm",
  cancelText = "Cancel",
  okLoading = false,
  title,
  trigger,
  onConfirm,
  onCancel,
  onOpenChange,
  ...rest
}: AlertModalProps) => {
  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      onOpenChange?.(isOpen);
      if (!isOpen) {
        onCancel?.();
      }
    },
    [onOpenChange, onCancel],
  );

  return (
    <AlertDialog onOpenChange={handleOpenChange} {...rest}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            isControlled={rest.open !== undefined}
            loading={okLoading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm?.();
            }}
            onKeyDown={(e) => e.key === "Enter" && onConfirm?.()}
          >
            {okText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

import React from "react";

import type { ModalProps } from "../modal";
import { LoadingIcon } from "../button";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./_components";

export type AlertModalProps = Omit<ModalProps, "onOk"> & {
  onConfirm?: () => void;
};

export const AlertModal = ({
  className,
  classNames,
  description,
  okText = "Confirm",
  cancelText = "Cancel",
  confirmLoading = false,
  title,
  trigger,
  onConfirm,
  onCancel,
  onOpenChange,

  children,

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

  const isShadcnAlertDialog = !!children;
  if (isShadcnAlertDialog) {
    return (
      <AlertDialogRoot onOpenChange={onOpenChange} {...rest}>
        {children}
      </AlertDialogRoot>
    );
  }

  return (
    <AlertDialogRoot onOpenChange={handleOpenChange} {...rest}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className={className}>
        <AlertDialogHeader className={classNames?.header}>
          {title && (
            <AlertDialogTitle className={classNames?.title}>
              {title}
            </AlertDialogTitle>
          )}
          <AlertDialogDescription className={classNames?.description}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className={classNames?.footer}>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            isOpenControlled={rest.open !== undefined}
            onClick={(e) => {
              e.preventDefault();
              onConfirm?.();
            }}
            onKeyDown={(e) => e.key === "Enter" && onConfirm?.()}
          >
            {confirmLoading && <LoadingIcon />}
            {okText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
};

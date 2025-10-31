import React from "react";
import { cn } from "@/lib/utils";

import type { ModalProps } from "../modal";
import { Icon } from "../../icons";
import { buttonColorVariants, buttonVariants, LoadingIcon } from "../button";
import { tagColors } from "../tag";
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
  type?: "confirm" | "warning" | "info" | "success" | "error";
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
  type = "confirm",
  children,
  okButtonProps,
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
      <AlertDialog onOpenChange={onOpenChange} {...rest}>
        {children}
      </AlertDialog>
    );
  }

  const isWarning = type === "warning";
  const isError = type === "error";
  const isInfo = type === "info";
  const isSuccess = type === "success";
  const isSimpleType = isWarning || isError || isInfo || isSuccess;

  const getIconConfig = () => {
    switch (type) {
      case "warning": {
        return {
          icon: "icon-[lucide--alert-triangle]",
          class: tagColors.warning,
        };
      }
      case "error": {
        return {
          icon: "icon-[ix--error-filled]",
          class: tagColors.error,
        };
      }
      case "info": {
        return {
          icon: "icon-[si--info-fill]",
          class: tagColors.processing,
        };
      }
      case "success": {
        return {
          icon: "icon-[lucide--check-circle]",
          class: tagColors.success,
        };
      }
      default: {
        return null;
      }
    }
  };

  const iconConfig = getIconConfig();

  return (
    <AlertDialog onOpenChange={handleOpenChange} {...rest}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className={className}>
        {iconConfig && (
          <div className="flex justify-center">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full",
                iconConfig.class,
              )}
            >
              <Icon icon={iconConfig.icon} className={cn("size-10")} />
            </div>
          </div>
        )}
        <AlertDialogHeader
          className={cn(classNames?.header, isSimpleType && "text-center")}
        >
          {title && (
            <AlertDialogTitle
              className={cn(classNames?.title, isSimpleType && "text-center")}
            >
              {title}
            </AlertDialogTitle>
          )}
          {description && (
            <AlertDialogDescription
              className={cn(
                classNames?.description,
                isSimpleType && "text-center",
              )}
            >
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter
          className={cn(classNames?.footer, isSimpleType && "flex-col")}
        >
          {!isSimpleType && (
            <AlertDialogCancel
              className={cn(
                buttonVariants({
                  size: "middle",
                }),
                buttonColorVariants({
                  variant: "outlined",
                }),
              )}
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm?.();
            }}
            onKeyDown={(e) => e.key === "Enter" && onConfirm?.()}
            className={cn(
              buttonVariants({
                size: "middle",
              }),
              buttonColorVariants({
                variant: okButtonProps?.variant ?? "solid",
                color: okButtonProps?.color ?? "primary",
              }),
              isSimpleType && "w-full",
            )}
          >
            {confirmLoading && <LoadingIcon />}
            {okText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

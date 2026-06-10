import React from "react";

import { cn } from "@acme/ui/lib/utils";

import type { ModalProps as ModalProperties } from "../modal";
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
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./_components";

export type AlertModalProps = Omit<ModalProperties, "onOk"> & {
  onConfirm?: () => void;
  type?: "confirm" | "warning" | "info" | "success" | "error";
  media?: React.ReactNode;
  /** Body content rendered between the description and the footer
   * (e.g. a textarea asking for a reason before confirming). */
  children?: React.ReactNode;
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
  media,
  okType,
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

  const isWarning = type === "warning";
  const isError = type === "error";
  const isInfo = type === "info";
  const isSuccess = type === "success";

  // info/success: notification style — centered icon on top, single full-width button.
  const isNotificationType = isInfo || isSuccess;
  // warning/error: confirm style — icon left of the title, left-aligned text,
  // two buttons aligned right, with a soft (filled) action colored by type.
  const isIconConfirmType = isWarning || isError;

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
          icon: "icon-[lucide--circle-alert]",
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
        return;
      }
    }
  };

  const iconConfig = getIconConfig();

  // info/success: big round badge centered on top.
  const notificationBadge = iconConfig && (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full",
        iconConfig.class,
      )}
    >
      <Icon icon={iconConfig.icon} className="size-10" />
    </div>
  );

  // warning/error: round badge left of the title — sized close to the title's
  // leading (text-lg → leading-7) so it aligns with the first line.
  const confirmIcon = iconConfig && (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full",
        iconConfig.class,
      )}
    >
      <Icon icon={iconConfig.icon} className="size-4" />
    </span>
  );

  const header = (
    <AlertDialogHeader
      className={cn(classNames?.header, isNotificationType && "text-center")}
    >
      {title && (
        <AlertDialogTitle
          className={cn(classNames?.title, isNotificationType && "text-center")}
        >
          {title}
        </AlertDialogTitle>
      )}
      {description && (
        <AlertDialogDescription
          className={cn(
            classNames?.description,
            isNotificationType && "text-center",
          )}
        >
          {description}
        </AlertDialogDescription>
      )}
    </AlertDialogHeader>
  );

  return (
    <AlertDialog onOpenChange={handleOpenChange} {...rest}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className={className}>
        {media && <AlertDialogMedia>{media}</AlertDialogMedia>}

        {isIconConfirmType ? (
          <div className="flex gap-3">
            {confirmIcon}
            {header}
          </div>
        ) : (
          <>
            {notificationBadge && (
              <div className="flex justify-center">{notificationBadge}</div>
            )}
            {header}
          </>
        )}

        {children}

        <AlertDialogFooter
          className={cn(classNames?.footer, isNotificationType && "flex-col")}
        >
          {!isNotificationType && (
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
                color:
                  okButtonProps?.color ??
                  (isError || okType === "danger" ? "danger" : "primary"),
              }),
              isNotificationType && "w-full",
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

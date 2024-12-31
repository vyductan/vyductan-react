"use client";

import type { ExternalToast } from "sonner";
import { toast } from "sonner";

import type { PromiseData, PromiseT } from "./types";

const baseFunction = (
  function_: (
    message: string | React.ReactNode,
    options?: ExternalToast,
  ) => string | number,
  message: React.ReactNode,
  options?: ExternalToast,
) => {
  return function_(message, {
    position: "top-center",
    ...options,
  });
};
const message = Object.assign(
  (message: React.ReactNode, options?: ExternalToast) =>
    baseFunction(toast, message, options),
  {
    success: (message: React.ReactNode, options?: ExternalToast) =>
      baseFunction(toast.success, message, options),
    info: (message: React.ReactNode, options?: ExternalToast) =>
      baseFunction(toast.info, message, options),
    warning: (message: React.ReactNode, options?: ExternalToast) =>
      baseFunction(toast.warning, message, options),
    error: (message: React.ReactNode, options?: ExternalToast) =>
      baseFunction(toast.error, message, options),
    loading: (message: React.ReactNode, options?: ExternalToast) =>
      baseFunction(toast.loading, message, options),
    message: (message: React.ReactNode, options?: ExternalToast) =>
      baseFunction(toast.message, message, options),
    custom: (
      jsx: (id: number | string) => React.ReactElement<any>,
      options?: ExternalToast,
    ) => toast.custom(jsx, { position: "top-center", ...options }),
    promise: <ToastData>(
      promise: PromiseT<ToastData>,
      options?: PromiseData<ToastData>,
    ) => toast.promise(promise, { position: "top-center", ...options }),
    dismiss: toast.dismiss,
  },
);

const baseNotification = (
  function_: (
    message: string | React.ReactNode,
    options?: ExternalToast,
  ) => string | number,
  { message, ...options }: NotificationProps,
) => {
  return function_(message, { ...options });
};
type NotificationProps = {
  message: React.ReactNode;
} & ExternalToast;
const notification = Object.assign(
  (options: NotificationProps) => baseNotification(toast, options),
  {
    success: (options: NotificationProps) =>
      baseNotification(toast.success, options),
    info: (options: NotificationProps) => baseNotification(toast.info, options),
    warning: (options: NotificationProps) =>
      baseNotification(toast.warning, options),
    error: (options: NotificationProps) =>
      baseNotification(toast.error, options),
    loading: (options: NotificationProps) =>
      baseNotification(toast.loading, options),
    message: (options: NotificationProps) =>
      baseNotification(toast.message, options),
    custom: (
      jsx: (id: number | string) => React.ReactElement<any>,
      options?: ExternalToast,
    ) => toast.custom(jsx, options),
    promise: <ToastData>(
      promise: PromiseT<ToastData>,
      options?: PromiseData<ToastData>,
    ) => toast.promise(promise, options),
    dismiss: toast.dismiss,
  },
);

export { message, notification };

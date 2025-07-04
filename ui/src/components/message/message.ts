"use client";

import type { ExternalToast } from "sonner";
import { toast } from "sonner";

import type { PromiseData, PromiseT } from "../toast/types";

const message = Object.assign(
  (message: React.ReactNode, options?: ExternalToast) =>
    toast(message, options),
  {
    success: (message: React.ReactNode, options?: ExternalToast) =>
      toast.success(message, {
        position: "top-center",
        ...options,
      }),
    info: (message: React.ReactNode, options?: ExternalToast) =>
      toast.info(message, {
        position: "top-center",
        ...options,
      }),
    warning: (message: React.ReactNode, options?: ExternalToast) =>
      toast.warning(message, {
        position: "top-center",
        ...options,
      }),
    error: (message: React.ReactNode, options?: ExternalToast) =>
      toast.error(message, {
        position: "top-center",
        ...options,
      }),
    loading: (message: React.ReactNode, options?: ExternalToast) =>
      toast.loading(message, {
        position: "top-center",
        ...options,
      }),
    message: (message: React.ReactNode, options?: ExternalToast) =>
      toast(message, {
        position: "top-center",
        ...options,
      }),
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

export { message };

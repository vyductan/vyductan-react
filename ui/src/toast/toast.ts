import type { ExternalToast } from "sonner";
import { toast } from "sonner";

import type { PromiseData, PromiseT } from "./types";

const baseFn = (
  fn: (
    message: string | React.ReactNode,
    data?: ExternalToast,
  ) => string | number,
  message: React.ReactNode,
  options?: ExternalToast | undefined,
) => {
  return fn(message, { position: "top-center", ...options });
};
const message = Object.assign(
  (message: React.ReactNode, options?: ExternalToast | undefined) =>
    baseFn(toast, message, options),
  {
    success: (message: React.ReactNode, options?: ExternalToast | undefined) =>
      baseFn(toast.success, message, options),
    info: (message: React.ReactNode, options?: ExternalToast | undefined) =>
      baseFn(toast.info, message, options),
    warning: (message: React.ReactNode, options?: ExternalToast | undefined) =>
      baseFn(toast.warning, message, options),
    error: (message: React.ReactNode, options?: ExternalToast | undefined) =>
      baseFn(toast.error, message, options),
    loading: (message: React.ReactNode, options?: ExternalToast | undefined) =>
      baseFn(toast.loading, message, options),
    message: (message: React.ReactNode, options?: ExternalToast | undefined) =>
      baseFn(toast.message, message, options),
    custom: (
      jsx: (id: number | string) => React.ReactElement,
      options?: ExternalToast,
    ) => toast.custom(jsx, { position: "top-center", ...options }),
    promise: <ToastData>(
      promise: PromiseT<ToastData>,
      options?: PromiseData<ToastData>,
    ) => toast.promise(promise, { position: "top-center", ...options }),
    dismiss: toast.dismiss,
  },
);

const notification = toast;

export { notification, message };

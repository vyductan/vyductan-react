import type { ExternalToast } from "sonner";
import { toast } from "sonner";

import type { PromiseData, PromiseT } from "./types";

const baseFunction = (
  function_: (
    message: string | React.ReactNode,
    data?: ExternalToast,
  ) => string | number,
  message: React.ReactNode,
  options?: ExternalToast | undefined,
) => {
  return function_(message, { position: "top-center", ...options });
};
const message = Object.assign(
  (message: React.ReactNode, options?: ExternalToast | undefined) =>
    baseFunction(toast, message, options),
  {
    success: (message: React.ReactNode, options?: ExternalToast | undefined) =>
      baseFunction(toast.success, message, options),
    info: (message: React.ReactNode, options?: ExternalToast | undefined) =>
      baseFunction(toast.info, message, options),
    warning: (message: React.ReactNode, options?: ExternalToast | undefined) =>
      baseFunction(toast.warning, message, options),
    error: (message: React.ReactNode, options?: ExternalToast | undefined) =>
      baseFunction(toast.error, message, options),
    loading: (message: React.ReactNode, options?: ExternalToast | undefined) =>
      baseFunction(toast.loading, message, options),
    message: (message: React.ReactNode, options?: ExternalToast | undefined) =>
      baseFunction(toast.message, message, options),
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

export { message };

export { toast as notification } from "sonner";

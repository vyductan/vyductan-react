/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ExternalToast } from "sonner";

import type { PromiseData, PromiseT } from "../toast/types";
import { toast } from "../toast";

type NotificationProperties = {
  message: React.ReactNode;
} & ExternalToast;
const notification = Object.assign(
  ({ message, ...options }: NotificationProperties) => toast(message, options),
  {
    success: ({ message, ...options }: NotificationProperties) =>
      toast.success(message, options),
    info: ({ message, ...options }: NotificationProperties) =>
      toast.info(message, options),
    warning: ({ message, ...options }: NotificationProperties) =>
      toast.warning(message, options),
    error: ({ message, ...options }: NotificationProperties) =>
      toast.error(message, options),
    loading: ({ message, ...options }: NotificationProperties) =>
      toast.loading(message, options),
    message: ({ message, ...options }: NotificationProperties) =>
      toast(message, options),
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

export { notification };

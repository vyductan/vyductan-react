import type { ExternalToast } from "sonner";

import type { PromiseData, PromiseT } from "../toast/types";
import { toast } from "../toast";

type NotificationProps = {
  message: React.ReactNode;
} & ExternalToast;
const notification = Object.assign(
  ({ message, ...options }: NotificationProps) => toast(message, options),
  {
    success: ({ message, ...options }: NotificationProps) =>
      toast.success(message, options),
    info: ({ message, ...options }: NotificationProps) =>
      toast.info(message, options),
    warning: ({ message, ...options }: NotificationProps) =>
      toast.warning(message, options),
    error: ({ message, ...options }: NotificationProps) =>
      toast.error(message, options),
    loading: ({ message, ...options }: NotificationProps) =>
      toast.loading(message, options),
    message: ({ message, ...options }: NotificationProps) =>
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

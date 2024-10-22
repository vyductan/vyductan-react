import type { ToastT } from "sonner";

export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);
type PromiseExternalToast = Omit<ExternalToast, "description">;
export type PromiseData<ToastData = any> = PromiseExternalToast & {
  loading?: string | React.ReactNode;
  success?:
    | string
    | React.ReactNode
    | ((data: ToastData) => React.ReactNode | string);
  error?: string | React.ReactNode | ((error: any) => React.ReactNode | string);
  description?:
    | string
    | React.ReactNode
    | ((data: any) => React.ReactNode | string);
  finally?: () => void | Promise<void>;
};
type ExternalToast = Omit<
  ToastT,
  "id" | "type" | "title" | "jsx" | "delete" | "promise"
> & {
  id?: number | string;
};

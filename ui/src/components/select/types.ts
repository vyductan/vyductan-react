import type { AnyObject } from "../_util/type";

export type Option<TValue = any, TRecord extends AnyObject = AnyObject> = {
  label: React.ReactNode;
  value: TValue;
  icon?: string;
  color?: string;
  checked?: boolean;
  className?: string;
  onSelect?: () => void;
} & TRecord;

export type RenderNode = React.ReactNode | ((props: any) => React.ReactNode);

export type Mode = "multiple" | "tags";

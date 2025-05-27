import type { AnyObject } from "../../types";

export type Option<TValue = any, TRecord extends AnyObject = AnyObject> = {
  label: React.ReactNode;
  value: TValue;
  icon?: string;
  color?: string;
  checked?: boolean;
  className?: string;
  onSelect?: () => void;
} & TRecord;

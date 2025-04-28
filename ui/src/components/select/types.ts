import type { AnyObject } from "../../types";
import type { ValueType } from "../form";

export type Option<
  T extends ValueType = string,
  TRecord extends AnyObject = AnyObject,
> = {
  label: React.ReactNode;
  value: T;
  icon?: string;
  color?: string;
  checked?: boolean;
  className?: string;
  onSelect?: () => void;
} & TRecord;

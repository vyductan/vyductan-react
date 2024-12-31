import type { ValueType } from "../form";

export type Option<T extends ValueType = string> = {
  label: React.ReactNode;
  value: T;
  icon?: string;
  color?: string;
  checked?: boolean;
  className?: string;
  onSelect?: () => void;
};

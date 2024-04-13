import type { ValueType } from "../form";

export type Option<T extends ValueType = string> = {
  label: React.ReactNode;
  value: T;
  icon?: string;
};

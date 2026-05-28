import type { OptionProps as OptionProperties } from "./option";

export interface DataDrivenOptionProps extends Omit<
  OptionProperties,
  "children"
> {
  label?: React.ReactNode;
}

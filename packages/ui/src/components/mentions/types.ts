import type { OptionProps } from "./option";

export interface DataDrivenOptionProps extends Omit<OptionProps, "children"> {
  label?: React.ReactNode;
}

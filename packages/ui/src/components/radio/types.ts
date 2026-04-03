import type { FormValueType } from "../form";
import type { RadioProps } from "./radio";

export interface RadioChangeEventTarget<
  T extends FormValueType = FormValueType,
> extends Omit<RadioProps<T>, "value"> {
  value: T;
  checked: boolean;
  type: "checkbox" | "radio";
}
export interface RadioChangeEvent<T extends FormValueType = FormValueType> {
  type: "change";
  target: RadioChangeEventTarget<T>;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: MouseEvent;
}

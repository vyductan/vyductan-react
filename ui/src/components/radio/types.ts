import type { RadioProps } from "./radio";

export interface RadioChangeEventTarget extends RadioProps {
  checked: boolean;
  type: "checkbox" | "radio";
}
export interface RadioChangeEvent {
  type: "change";
  target: RadioChangeEventTarget;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: MouseEvent;
}

import type { InputProps } from "../input";
import type { BaseInputProps } from "../types";

export function hasAddon(props: BaseInputProps | InputProps) {
  return !!(props.addonBefore ?? props.addonAfter);
}

export function hasPrefixSuffix(props: BaseInputProps | InputProps) {
  return !!(props.prefix ?? props.suffix ?? props.allowClear);
}

export interface InputFocusOptions extends FocusOptions {
  cursor?: "start" | "end" | "all";
}

export function triggerFocus(
  element?: HTMLInputElement | HTMLTextAreaElement,
  option?: InputFocusOptions,
) {
  if (!element) return;

  element.focus(option);

  // Selection content
  const { cursor } = option ?? {};
  if (cursor) {
    const length = element.value.length;

    switch (cursor) {
      case "start": {
        element.setSelectionRange(0, 0);
        break;
      }

      case "end": {
        element.setSelectionRange(length, length);
        break;
      }

      default: {
        element.setSelectionRange(0, length);
      }
    }
  }
}

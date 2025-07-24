// export interface InputFocusOptions extends FocusOptions {
//   cursor?: "start" | "end" | "all";
// }
// export interface InputRef {
//   focus: (options?: InputFocusOptions) => void;
//   blur: () => void;
//   setSelectionRange: (
//     start: number,
//     end: number,
//     direction?: "forward" | "backward" | "none",
//   ) => void;
//   select: () => void;
//   input: HTMLInputElement | null;
//   nativeElement: HTMLElement | null;
// }

import type {
  CSSProperties,
  InputHTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from "react";

import type { InputFocusOptions } from "./utils/common-utils";
import type { InputStatus, InputVariant } from "./variants";

export interface CommonInputProps {
  prefix?: ReactNode;
  suffix?: ReactNode;
  addonBefore?: ReactNode;
  addonAfter?: ReactNode;
  classNames?: {
    affixWrapper?: string;
    prefix?: string;
    suffix?: string;
    groupWrapper?: string;
    wrapper?: string;
    variant?: string;

    input?: string;
  };
  styles?: {
    affixWrapper?: CSSProperties;
    prefix?: CSSProperties;
    suffix?: CSSProperties;
  };
  allowClear?: boolean | { clearIcon?: ReactNode };
}

type DataAttribute = Record<`data-${string}`, string>;

export type InputValueType =
  | InputHTMLAttributes<HTMLInputElement>["value"]
  | bigint;

export type BaseInputProps = CommonInputProps & {
  value?: InputValueType | null;

  disabled?: boolean;
  hidden?: boolean;
  status?: InputStatus;
  variant?: InputVariant;
  style?: CSSProperties;
  className?: string;

  focused?: boolean;
  triggerFocus?: () => void;
  readOnly?: boolean;
  handleReset?: MouseEventHandler;
  onClear?: () => void;

  dataAttrs?: {
    affixWrapper?: DataAttribute;
  };
  components?: {
    affixWrapper?: "span" | "div";
    groupWrapper?: "span" | "div";
    wrapper?: "span" | "div";
    groupAddon?: "span" | "div";
  };
  children: ReactElement;
};

export type ShowCountFormatter = (args: {
  value: string;
  count: number;
  maxLength?: number;
}) => ReactNode;
export type ExceedFormatter = (
  value: string,
  config: {
    max: number;
  },
) => string;
export interface CountConfig {
  max?: number;
  strategy?: (value: string) => number;
  show?: boolean | ShowCountFormatter;
  /** Trigger when content larger than the `max` limitation */
  exceedFormatter?: ExceedFormatter;
}

export interface InputRef {
  focus: (options?: InputFocusOptions) => void;
  blur: () => void;
  setSelectionRange: (
    start: number,
    end: number,
    direction?: "forward" | "backward" | "none",
  ) => void;
  select: () => void;
  input: HTMLInputElement | null;
  nativeElement: HTMLElement | null;

  // extends react-hook-form
  setCustomValidity: (msg: string) => void;
  reportValidity: () => boolean | undefined;
}

export interface ChangeEventInfo {
  source: "compositionEnd" | "change";
}

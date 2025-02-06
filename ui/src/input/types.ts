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
import type { VariantProps } from "tailwind-variants";

import type { inputVariants } from "./input";

export type InputRef = HTMLInputElement;

// https://github.com/react-component/input/blob/master/src/interface.ts
// Jul 16, 2024
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
  };
  styles?: {
    affixWrapper?: CSSProperties;
    prefix?: CSSProperties;
    suffix?: CSSProperties;
  };
  allowClear?: boolean | { clearIcon?: ReactNode };
}

type DataAttribute = Record<`data-${string}`, string>;

export type ValueType = InputHTMLAttributes<HTMLInputElement>["value"] | bigint;

export type BaseInputProps = CommonInputProps & {
  value?: ValueType | null;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  focused?: boolean;
  triggerFocus?: () => void;
  readOnly?: boolean;
  handleReset?: MouseEventHandler;
  onClear?: () => void;
  hidden?: boolean;
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

// const _InputStatuses = ["warning", "error", ""] as const;
// export type InputStatus = (typeof _InputStatuses)[number];
export type InputStatus = VariantProps<typeof inputVariants>["status"];

export type InputVariant = VariantProps<typeof inputVariants>["variant"];

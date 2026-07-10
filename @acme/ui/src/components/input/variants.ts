import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

const inputDisabledVariants = tv({
  variants: {
    disabled: {
      true: [
        "bg-background-active hover:border-input! cursor-not-allowed opacity-50",
      ],
    },
  },
  defaultVariants: {
    disabled: false,
  },
});
const inputVariants = tv({
  base: [
    "font-normal",
    // disable shadcn focus-visible classes
    "outline-0",
    // "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ],
  variants: {
    disabled: inputDisabledVariants.variants.disabled,
    // readOnly: {
    //   true: ["pointer-events-none cursor-not-allowed"],
    // },
    status: {
      default: [
        "border-input",
        "hover:border-primary-500",
        "focus-within:border-primary-500 focus-within:ring-primary-500/20",
        "focus-visible:border-primary-500 focus-visible:ring-primary-500/20",
      ],
      error: [
        "border-error",
        "hover:border-error-hover",
        "focus-within:border-error focus-within:ring-error/20",
        "focus-visible:border-error focus-visible:ring-error/20",
      ],
      warning: [
        "border-warning",
        "hover:border-warning-hover",
        "focus-within:border-warning focus-within:ring-warning/20",
        "focus-visible:border-warning focus-visible:ring-warning/20",
      ],
      success: [
        "border-success",
        "hover:border-success-hover",
        "focus-within:border-success focus-within:ring-success/20",
        "focus-visible:border-success focus-visible:ring-success/20",
      ],
    },
    variant: {
      outlined: [
        "border",
        "rounded-md",
        "transition-colors",
        "focus-within:ring-[3px]",
      ],
      filled: [
        "bg-accent rounded-md border-none shadow-none",
        "transition-colors",
      ],
      borderless: ["border-none", "transition-colors"],
      underlined: [
        "border-b",
        "border-t-0 border-r-0 border-l-0",
        "rounded-none",
        "transition-colors",
      ],
    },
  },
  defaultVariants: {
    variant: "outlined",
    status: "default",
    disabled: false,
  },
});
const inputInlineInsetClassName = "pl-3";

// Single source for the size -> control-height/text invariant. Every input-
// family size table (plain input, affix wrapper, InputNumber spinner) derives
// from these; do not restate h-6/h-8/h-10 elsewhere.
const controlHeightBySize = {
  small: "h-6",
  middle: "h-8",
  large: "h-10",
} as const;

const controlTextBySize = {
  small: "",
  middle: "text-sm",
  large: "text-base",
} as const;

const inputAffixWrapperSizeVariants = tv({
  variants: {
    size: controlHeightBySize,
  },
  defaultVariants: {
    size: "middle",
  },
});

const inputSizeVariants = tv({
  variants: {
    size: {
      small: [controlHeightBySize.small, "px-2 py-1"],
      middle: [controlHeightBySize.middle, "px-3 py-1", controlTextBySize.middle],
      large: [controlHeightBySize.large, "px-3 py-2", controlTextBySize.large],
    },
  },
  defaultVariants: {
    size: "middle",
  },
});
type InputVariants = VariantProps<typeof inputVariants>;
type InputSizeVariants = VariantProps<typeof inputSizeVariants>;
type InputVariant = VariantProps<typeof inputVariants>["variant"];
type InputStatus = VariantProps<typeof inputVariants>["status"];

export type { InputVariants, InputSizeVariants, InputVariant, InputStatus };
export {
  inputVariants,
  inputDisabledVariants,
  inputInlineInsetClassName,
  inputAffixWrapperSizeVariants,
  inputSizeVariants,
  controlHeightBySize,
  controlTextBySize,
};

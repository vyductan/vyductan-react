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
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
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
const inputSizeVariants = tv({
  variants: {
    size: {
      // sm: "px-[7px] py-px",
      // default: "h-8 px-[11px] py-[5px]",
      // lg: "px-[11px] py-[9px]",
      // xl: "px-[11px] py-[13px]",
      small: "h-7 px-2 py-1",
      middle: "h-8 px-3 py-1 text-sm",
      large: "h-10 px-3 py-2 text-base",
      // xl: "px-[11px] py-[13px]",
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
export { inputVariants, inputDisabledVariants, inputSizeVariants };

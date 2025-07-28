import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

const inputVariants = tv({
  base: [
    // disable shadcn focus-visible classes
    "outline-0",
    // "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    // "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    // own
    // "h-auto text-sm",
    // "[&_input]:w-full",
    // ....
    // "h-9 text-base md:text-sm",
    // "placeholder:text-muted-foreground", // moved to <input>
    // disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 // moved to variant disabled
    // "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    // old
    // "focus-visible:outline-hidden",
    // "ring-offset-background",
    // "focus-within:outline-hidden",
  ],
  variants: {
    disabled: {
      true: [
        "bg-background-active hover:border-input! cursor-not-allowed opacity-50",
      ],
    },
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
        "focus-within:ring-2",
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
      small: "px-[7px] py-px",
      middle: "h-8 px-[11px] py-[5px]",
      large: "px-[11px] py-[9px]",
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
export { inputVariants, inputSizeVariants };

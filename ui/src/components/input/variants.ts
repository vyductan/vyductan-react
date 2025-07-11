import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

const inputVariants = tv({
  base: [
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
        "hover:border-primary-500",
        "focus-within:border-primary-600 focus-within:ring-primary-100",
      ],
      error: [
        "border-error text-error",
        "hover:border-error-hover",
        "focus-within:border-error focus-within:ring-error-muted",
      ],
      warning: [],
    },
    variant: {
      outlined: [
        "border",
        "rounded-md",
        "focus-within:ring-2",
        "focus-visible:border-primary-500 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      ],
      filled: ["bg-accent border-none shadow-none focus-within:ring-0"],
      borderless: ["border-0", "focus-within:outline-hidden", "shadow-none"],
      underlined: [],
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

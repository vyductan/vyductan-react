import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";

import { clsm } from "@vyductan/utils";

// TODO: rename
export const inputStatusVariants = cva(
  [
    "w-full",
    "bg-transparent",
    "text-sm",
    "placeholder:text-placeholder",
    "focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      borderless: {
        true: [
          "border-0",
          "focus-within:outline-none",
          // "focus-visible:outline-0",
        ],
        false: [
          "border",
          "rounded-md",
          "focus-visible:ring-2",
          // "rounded-md border border-input ring-offset-background",
          // "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
      },
      status: {
        default: [
          "border-primary-600",
          "hover:border-primary-400",
          "focus-visible:border-primary-600 focus-visible:ring-primary-200",
        ],
      },
    },
    defaultVariants: {
      borderless: false,
      status: "default",
    },
  },
);
type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputStatusVariants>;
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ borderless, className, status, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={clsm(
          inputStatusVariants({ borderless, status }),
          "w-full px-3 py-[9px]",
          "bg-transparent",
          "text-sm",
          "flex rounded-md border border-input ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300",
          "placeholder:text-placeholder",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
export type { InputProps };

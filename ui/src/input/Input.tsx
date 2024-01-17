import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cva } from "class-variance-authority";

import { clsm } from "@vyductan/utils";

export const inputStatusVariants = cva(
  [
    "w-full",
    "bg-transparent",
    "text-sm",
    "placeholder:text-placeholder",
    "focus-within:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      borderless: {
        true: ["border-0", "focus-within:outline-none"],
        false: ["border", "rounded-md", "focus-within:ring-2"],
      },
      status: {
        default: [
          "border-primary-600",
          "hover:border-primary-400",
          "focus-within:border-primary-600 focus-visible:ring-primary-200",
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
  VariantProps<typeof inputStatusVariants> & {
    suffix?: React.ReactNode;
  };
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ borderless, className, id, status, suffix, onChange, ...props }, ref) => {
    const useId = React.useId();
    const _id = id ?? useId;

    return (
      <span
        className={clsm(
          inputStatusVariants({ borderless, status }),
          "w-full px-3 py-[9px]",
          "bg-transparent",
          "text-sm",
          "flex rounded-md border border-input ring-offset-background",
          // "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "cursor-text",
          className,
        )}
        aria-hidden="true"
        onClick={() => {
          document.getElementById(_id)?.focus();
        }}
      >
        <input
          id={_id}
          className={clsm(
            "w-full",
            "border-none outline-none",
            "placeholder:text-muted-foreground",
          )}
          ref={ref}
          onChange={(e) => {
            onChange?.(e);
          }}
          {...props}
        />
        {suffix && <span>{suffix}</span>}
      </span>
    );
  },
);
Input.displayName = "Input";

export { Input };
export type { InputProps };

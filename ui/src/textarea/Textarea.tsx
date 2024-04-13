import type { VariantProps } from "class-variance-authority";
import type { TextareaAutosizeProps } from "react-textarea-autosize";
import * as React from "react";
import { cva } from "class-variance-authority";
import TextareaAutosize from "react-textarea-autosize";

import { clsm } from "@acme/ui";

import { inputStatusVariants } from "../input";

const textareaVariants = cva(
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
      size: {
        xs: "",
        sm: "",
        default: "px-3 py-[9px]",
        lg: "",
        xl: "p-4 text-md",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);
export type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "style"
> &
  VariantProps<typeof inputStatusVariants> &
  VariantProps<typeof textareaVariants> &
  Pick<
    TextareaAutosizeProps,
    "maxRows" | "minRows" | "onHeightChange" | "cacheMeasurements"
  > & {
    autoSize?: boolean;
  };

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ autoSize, borderless, className, size, status, ...props }, ref) => {
    const Comp = autoSize ? TextareaAutosize : "textarea";
    return (
      <Comp
        className={clsm(
          inputStatusVariants({ borderless, status }),
          textareaVariants({ className, size }),
        )}
        ref={ref}
        {...(typeof autoSize === "object" ? autoSize : {})}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };

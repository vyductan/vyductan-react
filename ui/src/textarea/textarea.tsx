import type { VariantProps } from "class-variance-authority";
import type { TextareaAutosizeProps } from "react-textarea-autosize";
import * as React from "react";
import { cva } from "class-variance-authority";
import TextareaAutosize from "react-textarea-autosize";

import { cn } from "..";
import { inputVariants } from "../input";

const textareaVariants = cva(
  [
    "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    // own
    "text-sm",
  ],
  {
    variants: {
      // can we move to use input size varirant
      size: {
        xs: "",
        sm: "",
        default: "px-[11px] py-[5px]",
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
  VariantProps<typeof inputVariants> &
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
        className={cn(
          inputVariants({ borderless, status }),
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

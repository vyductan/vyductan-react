import * as React from "react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import TextareaAutosize from "react-textarea-autosize";
import type { TextareaAutosizeProps } from "react-textarea-autosize";

import { clsm } from "@vyductan/utils";

const textareaVariants = cva(
  [
    "min-h-[80px] w-full bg-transparent px-3 py-2 text-sm",
    "placeholder:text-muted-foreground",
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
          "rounded-md border border-input ring-offset-background",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
      },
    },
    defaultVariants: {
      borderless: false,
    },
  },
);
export type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "style"
> &
  VariantProps<typeof textareaVariants> & {
    autoSize?:
      | boolean
      | Pick<
          TextareaAutosizeProps,
          "maxRows" | "minRows" | "onHeightChange" | "cacheMeasurements"
        >;
  };

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ autoSize, borderless, className, ...props }, ref) => {
    const Comp = autoSize ? TextareaAutosize : "textarea";
    return (
      <Comp
        className={clsm(textareaVariants({ borderless, className }))}
        ref={ref}
        {...(typeof autoSize === "object" ? autoSize : {})}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };

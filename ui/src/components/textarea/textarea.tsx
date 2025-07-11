import type { VariantProps } from "class-variance-authority";
import type { TextareaAutosizeProps } from "react-textarea-autosize";
import * as React from "react";
import { cva } from "class-variance-authority";
import TextareaAutosize from "react-textarea-autosize";

import type { TextareaProps as ShadcnTextareaProps } from "@acme/ui/shadcn/textarea";
import { cn } from "@acme/ui/lib/utils";
import { Textarea as TextareaShadcn } from "@acme/ui/shadcn/textarea";

import type { BaseInputProps, CommonInputProps, InputProps } from "../input";
import { inputVariants } from "../input/variants";

const textareaVariants = cva(["text-sm"], {
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
});
type TextAreaProps = Omit<ShadcnTextareaProps, "style"> &
  VariantProps<typeof inputVariants> &
  VariantProps<typeof textareaVariants> &
  Pick<
    TextareaAutosizeProps,
    "maxRows" | "minRows" | "onHeightChange" | "cacheMeasurements"
  > & {
    autoSize?: boolean;
    classNames?: CommonInputProps["classNames"] & {
      textarea?: string;
      count?: string;
    };
    styles?: {
      textarea?: React.CSSProperties;
      count?: React.CSSProperties;
    };
  } & Pick<BaseInputProps, "allowClear" | "suffix"> &
  Pick<InputProps, "showCount" | "count" | "onClear">;

const Textarea = ({
  ref,
  autoSize,
  className,
  size,
  status,
  variant,
  ...props
}: TextAreaProps) => {
  const Comp = autoSize ? TextareaAutosize : TextareaShadcn;
  return (
    <Comp
      className={cn(
        "field-sizing-fixed",
        inputVariants({ variant, status }),
        textareaVariants({ className, size }),
      )}
      ref={ref}
      {...(typeof autoSize === "object" ? autoSize : {})}
      {...props}
    />
  );
};

export type { TextAreaProps };
export { Textarea };

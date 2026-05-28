import type { VariantProps } from "class-variance-authority";
import type * as React from "react";
import type { TextareaAutosizeProps } from "react-textarea-autosize";
import { cva } from "class-variance-authority";
import TextareaAutosize from "react-textarea-autosize";

import type { Textarea as ShadcnTextarea } from "@acme/ui/shadcn/textarea";
import { cn } from "@acme/ui/lib/utils";
import { Textarea as TextareaShadcn } from "@acme/ui/shadcn/textarea";

import type {
  BaseInputProps as BaseInputProperties,
  CommonInputProps as CommonInputProperties,
  InputProps as InputProperties,
} from "../input";
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

type ShadcnTextareaProperties = React.ComponentProps<typeof ShadcnTextarea>;
type TextAreaProperties = Omit<ShadcnTextareaProperties, "style"> &
  VariantProps<typeof inputVariants> &
  VariantProps<typeof textareaVariants> &
  Pick<
    TextareaAutosizeProps,
    "maxRows" | "minRows" | "onHeightChange" | "cacheMeasurements"
  > & {
    autoSize?: boolean;
    classNames?: CommonInputProperties["classNames"] & {
      textarea?: string;
      count?: string;
    };
    styles?: {
      textarea?: React.CSSProperties;
      count?: React.CSSProperties;
    };
  } & Pick<BaseInputProperties, "allowClear" | "suffix"> &
  Pick<InputProperties, "showCount" | "count" | "onClear">;

const Textarea = ({
  ref,
  autoSize,
  className,
  size,
  status,
  variant,
  value,
  ...properties
}: TextAreaProperties) => {
  const Comp = autoSize ? TextareaAutosize : TextareaShadcn;
  // Ensure value is never null - convert null/undefined to empty string
  const safeValue = value ?? "";
  return (
    <Comp
      className={cn(
        "field-sizing-fixed",
        inputVariants({ variant, status }),
        textareaVariants({ className, size }),
      )}
      ref={ref}
      {...(typeof autoSize === "object" ? autoSize : {})}
      {...properties}
      value={safeValue}
    />
  );
};

export type { TextAreaProperties as TextAreaProps };
export { Textarea };

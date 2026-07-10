"use client";

import * as React from "react";

import { cn } from "@acme/ui/lib/utils";

import type {
  FloatingLabelSize,
  FloatingLabelStatus,
} from "./floating-label-shared";
import {
  floatingBorderClass,
  floatingLabelBaseClass,
  RequiredMark,
} from "./floating-label-shared";

type FloatingLabelTextareaProps = Omit<
  React.ComponentProps<"textarea">,
  "placeholder"
> & {
  label: React.ReactNode;
  containerClassName?: string;
  status?: FloatingLabelStatus;
  size?: FloatingLabelSize;
  required?: boolean;
};

/**
 * Outlined textarea with a floating label. Same peer/:placeholder-shown trick as
 * FloatingLabelInput, but the resting label sits on the first line (top-aligned)
 * instead of vertically centered, since a textarea is multi-line.
 */
const FloatingLabelTextarea = ({
  ref,
  label,
  id,
  className,
  containerClassName,
  status = "default",
  size = "md",
  required,
  disabled,
  ...properties
}: FloatingLabelTextareaProps & { ref?: React.Ref<HTMLTextAreaElement> }) => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const isError = status === "error";

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <textarea
        data-slot="floating-label-textarea"
        id={inputId}
        ref={ref}
        placeholder=" "
        disabled={disabled}
        aria-invalid={isError || properties["aria-invalid"]}
        className={cn(
          "peer text-foreground w-full rounded-md border bg-transparent px-3 py-3 text-sm outline-none transition-colors",
          size === "sm" ? "min-h-20" : "min-h-24",
          floatingBorderClass,
          className,
        )}
        {...properties}
      />
      <label
        htmlFor={inputId}
        className={cn(
          floatingLabelBaseClass,
          "peer-focus:text-primary-500 peer-aria-[invalid=true]:text-error peer-disabled:opacity-50",
          // resting: aligned to the first line (top), acts like the placeholder
          "top-3.5",
          // floated (focused OR filled): sit on the top border, shrink
          "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs",
          "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs",
          isError && "text-error peer-focus:text-error",
        )}
      >
        {label}
        {required && <RequiredMark />}
      </label>
    </div>
  );
};

export { FloatingLabelTextarea };
export type { FloatingLabelTextareaProps };

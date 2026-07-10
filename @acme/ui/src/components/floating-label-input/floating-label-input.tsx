"use client";

import * as React from "react";

import { cn } from "@acme/ui/lib/utils";

import type {
  FloatingLabelSize,
  FloatingLabelStatus,
} from "./floating-label-shared";
import {
  floatingBorderClass,
  floatingControlHeight,
  floatingLabelBaseClass,
  RequiredMark,
} from "./floating-label-shared";

type FloatingLabelInputProps = Omit<
  React.ComponentProps<"input">,
  // placeholder is reserved: the peer/:placeholder-shown trick needs it to be
  // a single space so the label can act as the resting placeholder.
  // `size` is repurposed for the visual variant, not the native char-width attr.
  "placeholder" | "size"
> & {
  label: React.ReactNode;
  /** class on the outer wrapper (position/width). */
  containerClassName?: string;
  status?: FloatingLabelStatus;
  size?: FloatingLabelSize;
  required?: boolean;
};

/**
 * MUI-style outlined text field: the label rests centered like a placeholder,
 * then floats onto the top border (masking it -> notch look) when the field is
 * focused or filled. Implemented with the Tailwind `peer` + `:placeholder-shown`
 * technique — no JS state, no fieldset/legend.
 *
 * Note: the notch is faked with `bg-background` on the label. On a non-default
 * surface (e.g. inside a card) pass `containerClassName`/`className` to override
 * the label bg so it matches the surface, or use the fieldset+legend variant.
 */
const FloatingLabelInput = ({
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
}: FloatingLabelInputProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const isError = status === "error";

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <input
        data-slot="floating-label-input"
        id={inputId}
        ref={ref}
        // required for the `:placeholder-shown` state — never remove.
        placeholder=" "
        disabled={disabled}
        aria-invalid={isError || properties["aria-invalid"]}
        className={cn(
          "peer text-foreground w-full rounded-md border bg-transparent px-3 text-sm outline-none transition-colors",
          floatingControlHeight[size],
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
          // resting: vertically centered, acts like the placeholder
          "top-1/2 -translate-y-1/2",
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

export { FloatingLabelInput };
export type { FloatingLabelInputProps };

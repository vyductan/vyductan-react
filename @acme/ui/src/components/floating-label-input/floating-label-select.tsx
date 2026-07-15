"use client";

import * as React from "react";
import { useMergedState } from "@rc-component/util";
import { ChevronDown } from "lucide-react";

import { cn } from "@acme/ui/lib/utils";

import type {
  FloatingLabelSize,
  FloatingLabelStatus,
} from "./floating-label-shared";
import {
  floatingBorderClass,
  floatingControlHeight,
  floatingLabelBaseClass,
  FLOATED,
  RequiredMark,
} from "./floating-label-shared";

type FloatingLabelSelectProps = Omit<
  React.ComponentProps<"select">,
  // `size` is repurposed for the visual variant, not the native rows attribute.
  "size"
> & {
  label: React.ReactNode;
  containerClassName?: string;
  status?: FloatingLabelStatus;
  size?: FloatingLabelSize;
  required?: boolean;
};

/**
 * Outlined native <select> with a floating label. A native select has no
 * `:placeholder-shown`, so the float state is tracked in JS: the label floats
 * when the select is focused OR has a non-empty value. A hidden empty option
 * anchors the "no selection" state so the label can rest like a placeholder.
 */
const FloatingLabelSelect = ({
  ref,
  label,
  id,
  className,
  containerClassName,
  status = "default",
  size = "md",
  required,
  disabled,
  children,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  ...properties
}: FloatingLabelSelectProps & { ref?: React.Ref<HTMLSelectElement> }) => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const ariaInvalid = properties["aria-invalid"];
  // status="error" OR a truthy aria-invalid (e.g. bound through <Field>)
  const isError =
    status === "error" || (!!ariaInvalid && ariaInvalid !== "false");

  const [mergedValue, setMergedValue] = useMergedState<
    React.ComponentProps<"select">["value"]
  >(defaultValue ?? "", { value });
  const [focused, setFocused] = React.useState(false);

  const hasValue = mergedValue !== "" && mergedValue != null;
  const floated = focused || hasValue;

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <select
        data-slot="floating-label-select"
        id={inputId}
        ref={ref}
        disabled={disabled}
        aria-invalid={isError || undefined}
        value={mergedValue}
        onChange={(event) => {
          setMergedValue(event.target.value);
          onChange?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        className={cn(
          "peer text-foreground w-full appearance-none rounded-md border bg-transparent pr-9 pl-3 text-sm outline-none transition-colors",
          floatingControlHeight[size],
          floatingBorderClass,
          className,
        )}
        {...properties}
      >
        {/* anchors the empty/resting state so the label can act as placeholder */}
        <option value="" disabled hidden />
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 peer-disabled:opacity-50"
      />
      <label
        htmlFor={inputId}
        className={cn(
          floatingLabelBaseClass,
          floated ? FLOATED : "top-1/2 -translate-y-1/2",
          focused && "text-primary-500",
          isError && "text-error",
          disabled && "opacity-50",
        )}
      >
        {label}
        {required && <RequiredMark />}
      </label>
    </div>
  );
};

export { FloatingLabelSelect };
export type { FloatingLabelSelectProps };

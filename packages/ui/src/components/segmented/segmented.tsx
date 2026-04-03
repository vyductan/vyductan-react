"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva } from "class-variance-authority";

import { cn } from "@acme/ui/lib/utils";

const segmentedVariants = cva(
  "inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
  {
    variants: {
      size: {
        default: "h-10",
        sm: "h-8",
        lg: "h-12",
      },
      block: {
        true: "w-full flex",
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      block: false,
    },
  },
);

export interface SegmentedOption {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export interface SegmentedProps
  extends
    Omit<
      React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
      "value" | "defaultValue" | "onValueChange" | "onChange"
    >,
    VariantProps<typeof segmentedVariants> {
  options: (string | number | SegmentedOption)[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

function stringifyValue(
  value: string | number | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return String(value);
}

function normalizeOption(
  option: string | number | SegmentedOption,
): SegmentedOption {
  if (typeof option === "string" || typeof option === "number") {
    const value = String(option);

    return { label: value, value };
  }

  return { ...option, value: String(option.value) };
}

const Segmented = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  SegmentedProps
>(
  (
    {
      className,
      size,
      block,
      options,
      value,
      defaultValue,
      onChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const normalizedOptions = options.map((option) => normalizeOption(option));

    return (
      <TabsPrimitive.Root
        ref={ref}
        value={stringifyValue(value)}
        defaultValue={stringifyValue(defaultValue)}
        onValueChange={onChange}
        className={className}
        {...props}
      >
        <TabsPrimitive.List
          className={cn(segmentedVariants({ size, block }), className)}
        >
          {normalizedOptions.map((option) => (
            <TabsPrimitive.Trigger
              key={option.value}
              value={option.value}
              disabled={disabled || option.disabled}
              className={cn(
                "ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm",
                block && "flex-1",
              )}
            >
              {option.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
      </TabsPrimitive.Root>
    );
  },
);
Segmented.displayName = "Segmented";

export { Segmented };

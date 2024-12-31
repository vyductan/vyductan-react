"use client";

import type * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";

import type { LabelProps } from "../label";
import { Label } from "../label";
import { useField } from "./use-field";

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, ...props }, ref) => {
  const { fieldId } = useField();

  return <Label ref={ref} htmlFor={fieldId} className={className} {...props} />;
});
FieldLabel.displayName = "FieldLabel";

export { FieldLabel, FieldLabel as FormLabel };

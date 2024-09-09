"use client";

import type * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";

import { Label } from "../label";
import { useField } from "./useField";

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { fieldId } = useField();

  return <Label ref={ref} htmlFor={fieldId} className={className} {...props} />;
});
FieldLabel.displayName = "FieldLabel";

export { FieldLabel };

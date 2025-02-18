"use client";

import * as React from "react";

import type { LabelProps } from "../../label";
import { cn } from "../..";
import { Label } from "../../label";
import { useFormField } from "../hooks/use-form-field";

const FormLabel = ({ className, ...props }: LabelProps) => {
  const { formItemId, error } = useFormField();

  return (
    <Label
      data-slot="form-label"
      htmlFor={formItemId}
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      {...props}
    />
  );
};

export { FormLabel as FieldLabel, FormLabel };

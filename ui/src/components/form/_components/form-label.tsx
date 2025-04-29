"use client";

import * as React from "react";

import { cn } from "@acme/ui/lib/utils";

import type { LabelProps } from "../../label";
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

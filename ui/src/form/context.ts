"use client";

import type { FieldPath, FieldValues } from "react-hook-form";
import * as React from "react";

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  id: string;
  fieldId: string;
  fieldDescriptionId: string;
  fieldMessageId: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

export { FormFieldContext };

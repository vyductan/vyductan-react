"use client";

import type { FieldPath, FieldValues } from "react-hook-form";
import * as React from "react";
import { useContext } from "react";

import type { FormInstance } from "./use-form";

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

type FormContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
> = FormInstance<TFieldValues, TContext, TTransformedValues>;

const FormContext = React.createContext<FormContextValue>(
  {} as FormContextValue,
);

const FormProvider = <
  TFieldValues extends FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  children,
  ...props
}: FormContextValue<TFieldValues, TContext, TTransformedValues> & {
  children: React.ReactNode;
}) => {
  return (
    <FormContext.Provider
      value={props as unknown as FormContextValue<FieldValues, any, undefined>}
    >
      {children}
    </FormContext.Provider>
  );
};

const useFormContext = <
  TFieldValues extends FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>() => {
  return useContext(FormContext) as unknown as FormContextValue<
    TFieldValues,
    TContext,
    TTransformedValues
  >;
};

export { FormFieldContext, FormProvider, useFormContext };

"use client";

import type {
  FieldPath,
  FieldValues,
  FormProviderProps as RHFormProviderProps,
} from "react-hook-form";
import * as React from "react";
import { createContext, useContext } from "react";

import type { Variant } from "../../config-provider";
import type { FormInstance } from "../hooks/use-form";

/* FormField */
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};
const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

/* FormItem */
type FormItemContextValue = {
  id: string;
};
const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

/** FormProvider */
type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = FieldValues,
> = RHFormProviderProps<TFieldValues, TContext, TTransformedValues> &
  Pick<
    FormInstance<TFieldValues, TContext, TTransformedValues>,
    "resetFields" | "setFieldsValue" | "schema" | "submit"
  > & {
    form?: FormInstance<TFieldValues, TContext, TTransformedValues>;
    layout?: "vertical" | "horizontal";
    classNames?: {
      label?: string;
    };
  };

const FormContext = createContext<FormProviderProps>({} as FormProviderProps);
const Provider = FormContext.Provider;

const useFormContext = <
  TFieldValues extends FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>() => {
  return useContext(FormContext) as unknown as
    | FormProviderProps<TFieldValues, TContext, TTransformedValues>
    | undefined;
};

const VariantContext = React.createContext<Variant | undefined>(undefined);

export type { FormProviderProps };
export {
  Provider,
  FormFieldContext,
  FormItemContext,
  FormContext,
  useFormContext,
  VariantContext,
};

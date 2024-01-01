"use client";

/**
 * Docs
 * https://github.com/react-component/field-form/blob/master/src/useForm.ts
 */
import type { BaseSyntheticEvent } from "react";
import type {
  FieldValues,
  SubmitHandler,
  UseFormReturn,
  UseFormProps as UseRHFormProps,
} from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm as useRHForm } from "react-hook-form";

type FormInstance<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
> = UseFormReturn<TFieldValues, TContext, TTransformedValues> & {
  submit: (
    e?: BaseSyntheticEvent<object, unknown, unknown> | undefined,
  ) => Promise<void>;
  defaultValues?: UseRHFormProps<TFieldValues>["defaultValues"];
};

type UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
> = UseRHFormProps<TFieldValues, TContext> & {
  schema?: z.ZodType<TFieldValues>;
  onSubmit: TTransformedValues extends undefined
    ? SubmitHandler<TFieldValues>
    : TTransformedValues extends FieldValues
      ? SubmitHandler<TTransformedValues>
      : never;
};
const useForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  defaultValues,
  schema,
  onSubmit,
}: UseFormProps<TFieldValues, TContext, TTransformedValues>): FormInstance<
  TFieldValues,
  TContext,
  TTransformedValues
> => {
  const methods = useRHForm<TFieldValues, TContext, TTransformedValues>({
    defaultValues,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  const formInstance = {
    ...methods,
    defaultValues: defaultValues,

    submit: methods.handleSubmit(onSubmit),
  };

  return formInstance;
};

export { useForm };
export type { UseFormProps, FormInstance };

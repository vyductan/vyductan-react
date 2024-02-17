"use client";

/**
 * Docs
 * https://github.com/react-component/field-form/blob/master/src/useForm.ts
 */
import type { BaseSyntheticEvent } from "react";
import type {
  DefaultValues,
  FieldValues,
  KeepStateOptions,
  SubmitHandler,
  UseFormReset,
  UseFormReturn,
  UseFormProps as UseRHFormProps,
} from "react-hook-form";
import type { z } from "zod";
import { useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm as useRHForm } from "react-hook-form";

import type { ResetAction } from "./types";

type FormInstance<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues = TFieldValues,
> = UseFormReturn<TFieldValues, TContext, TTransformedValues> & {
  submit: (
    e?: BaseSyntheticEvent<object, unknown, unknown> | undefined,
  ) => Promise<void>;
  setFieldsValue: UseFormReset<TFieldValues>;
  resetFields: (keepStateOptions?: KeepStateOptions) => void;
};

type UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues = TFieldValues,
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
  TTransformedValues extends FieldValues = TFieldValues,
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

  const { reset } = methods;

  const setFieldsValue = useCallback(
    (
      values?:
        | DefaultValues<TFieldValues>
        | TFieldValues
        | ResetAction<TFieldValues>,
      keepStateOptions?: KeepStateOptions,
    ) => {
      reset(values, {
        keepDefaultValues: true,
        ...keepStateOptions,
      });
    },
    [reset],
  );

  const resetFields = useCallback((keepStateOptions?: KeepStateOptions) => {
    if (typeof defaultValues === "function") {
      defaultValues()
        .then((values) => {
          return methods.reset(values, keepStateOptions);
        })
        .catch(() => void 0);
    } else {
      methods.reset(defaultValues, keepStateOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formInstance: FormInstance<TFieldValues, TContext, TTransformedValues> =
    {
      ...methods,
      submit: methods.handleSubmit(onSubmit),
      resetFields,
      setFieldsValue,
    };

  return formInstance;
};

export { useForm };
export type { UseFormProps, FormInstance };

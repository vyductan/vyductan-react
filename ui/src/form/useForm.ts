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
import { useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEqual, transform } from "lodash";
import { useForm as useRHForm, useWatch } from "react-hook-form";

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
>(
  props?: UseFormProps<TFieldValues, TContext, TTransformedValues> & {
    onValuesChange?: (
      changedValues: TFieldValues,
      allValues: TFieldValues,
    ) => void;
  },
): FormInstance<TFieldValues, TContext, TTransformedValues> => {
  const methods = useRHForm<TFieldValues, TContext, TTransformedValues>(
    props
      ? {
          defaultValues: props.defaultValues,
          resolver: props.schema ? zodResolver(props.schema) : undefined,
        }
      : undefined,
  );

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
    if (props) {
      if (typeof props.defaultValues === "function") {
        props
          .defaultValues()
          .then((values: TFieldValues) => {
            return methods.reset(values, keepStateOptions);
          })
          .catch(() => void 0);
      } else {
        methods.reset(props.defaultValues, keepStateOptions);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formInstance: FormInstance<TFieldValues, TContext, TTransformedValues> =
    {
      ...methods,
      submit: props
        ? methods.handleSubmit(props.onSubmit)
        : () => Promise.resolve(),
      resetFields,
      setFieldsValue,
    };

  // onValuesChange
  // has onValuesChange
  // form has values
  // values not same defaultValues
  const w = useWatch<TFieldValues>({ control: formInstance.control });
  useEffect(() => {
    if (
      props?.onValuesChange &&
      w &&
      !isEqual(formInstance.formState.defaultValues, w) &&
      Object.keys(w).length > 0
    ) {
      props.onValuesChange(
        getChangedValues(
          formInstance.formState.defaultValues,
          w,
        ) as TFieldValues,
        w as TFieldValues,
      );
    }
  }, [w]);

  return formInstance;
};

export { useForm };
export type { UseFormProps, FormInstance };

const getChangedValues = (
  obj1: Record<string, any> | undefined,
  obj2: Record<string, any>,
) => {
  if (!obj1) return obj2;
  return transform(
    obj1,
    (result, value, key) => {
      if (!isEqual(value, obj2[key])) {
        result[key] = obj2[key];
      }
    },
    {} as Record<string, any>,
  );
};

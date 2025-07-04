"use client";

/**
 * Docs
 * https://github.com/react-component/field-form/blob/master/src/useForm.ts
 * https://github.com/react-hook-form/react-hook-form/blob/master/src/useForm.ts
 */
import type { BaseSyntheticEvent } from "react";
import type {
  UseFormProps as __UseFormProps,
  DeepPartial,
  DefaultValues,
  FieldValues,
  KeepStateOptions,
  SubmitHandler,
  UseFormReset,
  UseFormReturn,
} from "react-hook-form";
import type { ZodType } from "zod/v4";
import { useCallback, useEffect, useRef } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import _ from "lodash";
import { useForm as __useForm } from "react-hook-form";

import type { ResetAction } from "../types";

type FormInstance<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = UseFormReturn<TFieldValues, TContext, TTransformedValues> & {
  schema?: ZodType | undefined;
  defaultValues?: UseFormProps<
    TFieldValues,
    TContext,
    TTransformedValues
  >["defaultValues"];
  submit: (
    event?: BaseSyntheticEvent<object, unknown, unknown>,
  ) => Promise<void>;
  setFieldsValue: UseFormReset<TFieldValues>;
  resetFields: (keepStateOptions?: KeepStateOptions) => void;
};

type UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = {
  schema?: ZodType<TTransformedValues, TFieldValues>;
  onSubmit?: SubmitHandler<TTransformedValues>;
  onValuesChange?: (
    changedValues: Partial<TFieldValues>,
    values: DeepPartial<TFieldValues>,
  ) => void;
} & __UseFormProps<TFieldValues, TContext, TTransformedValues>;
const useForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>(
  props?: UseFormProps<TFieldValues, TContext, TTransformedValues>,
): FormInstance<TFieldValues, TContext, TTransformedValues> => {
  const { schema, onSubmit, ...restProps } = props ?? {};

  const methods = __useForm<TFieldValues, TContext, TTransformedValues>(
    props
      ? {
          resolver: schema
            ? standardSchemaResolver<
                TFieldValues,
                TContext,
                TTransformedValues
              >(schema)
            : undefined,
          // defaultValues: props.defaultValues,
          // values: props.values,
          ...restProps,
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

  const resetFields = useCallback(
    (keepStateOptions?: KeepStateOptions) => {
      if (props) {
        if (typeof props.defaultValues === "function") {
          // props
          //   .defaultValues()
          //   .then((values: TFieldValues) => {
          //     return methods.reset(values, keepStateOptions);
          //   })
          //   .catch(() => void 0);
        } else {
          methods.reset(props.defaultValues, keepStateOptions);
        }
      }
    },
    [methods, props],
  );
  const _formControl =
    useRef<FormInstance<TFieldValues, TContext, TTransformedValues>>(null);

  const submit = useCallback(
    (event?: BaseSyntheticEvent<object, unknown, unknown>) => {
      return onSubmit
        ? methods.handleSubmit(onSubmit)(event)
        : Promise.resolve();
    },
    [methods, onSubmit],
  );

  _formControl.current ??= {
    ...methods,
    schema,
    defaultValues: props?.defaultValues,
    submit,
    resetFields,
    setFieldsValue,
  };

  const { onValuesChange } = props ?? {};
  useEffect(() => {
    if (!onValuesChange) return;

    // Use watch to detect changes
    const subscription = methods.watch((value, info) => {
      if (info.type === "change") {
        onValuesChange(info.name ? value[info.name] : {}, value);
      }
    });

    return () => subscription.unsubscribe();
  }, [methods, onValuesChange]);

  _formControl.current.submit = submit;
  _formControl.current.formState = methods.formState;

  return _formControl.current;
};

export { useForm };
export type { UseFormProps, FormInstance };

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
import type { z, ZodSchema } from "zod";
import { useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import _ from "lodash";
import { useForm as useRHForm, useWatch } from "react-hook-form";

import type { ResetAction } from "./types";

type FormInstance<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
> = UseFormReturn<TFieldValues, TContext, TTransformedValues> & {
  schema: ZodSchema | undefined;
  submit: (
    event?: BaseSyntheticEvent<object, unknown, unknown>,
  ) => Promise<void>;
  setFieldsValue: UseFormReset<TFieldValues>;
  resetFields: (keepStateOptions?: KeepStateOptions) => void;
};

type UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
> = UseRHFormProps<TFieldValues, TContext> & {
  schema?: z.ZodType<TFieldValues>;
  onSubmit?: TTransformedValues extends undefined
    ? SubmitHandler<TFieldValues>
    : TTransformedValues extends FieldValues
      ? SubmitHandler<TTransformedValues>
      : never;
  onValuesChange?: (
    changedValues: TFieldValues,
    allValues: TFieldValues,
  ) => void;
};
const useForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>(
  props?: UseFormProps<TFieldValues, TContext, TTransformedValues>,
): FormInstance<TFieldValues, TContext, TTransformedValues> => {
  const methods = useRHForm<TFieldValues, TContext, TTransformedValues>(
    props
      ? {
          defaultValues: props.defaultValues,
          values: props.values,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const submit = useCallback(
    (event?: BaseSyntheticEvent<object, unknown, unknown>) => {
      return props
        ? methods.handleSubmit(props.onSubmit ?? ((() => void 0) as any))(event)
        : Promise.resolve();
    },
    [methods, props],
  );

  const formInstance: FormInstance<TFieldValues, TContext, TTransformedValues> =
    {
      ...methods,
      schema: props?.schema,
      submit,
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
      !_.isEqual(formInstance.formState.defaultValues, w) &&
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
  }, [w, formInstance.formState.defaultValues, props]);

  return formInstance;
};

export { useForm };
export type { UseFormProps, FormInstance };

const getChangedValues = (
  object1: Record<string, any> | undefined,
  object2: Record<string, any>,
) => {
  if (!object1) return object2;
  return _.transform(
    object1,
    (result, value, key) => {
      if (!_.isEqual(value, object2[key])) {
        result[key] = object2[key];
      }
    },
    {} as Record<string, any>,
  );
};

"use client";

/**
 * Docs
 * https://github.com/react-component/field-form/blob/master/src/useForm.ts
 * https://github.com/react-hook-form/react-hook-form/blob/master/src/useForm.ts
 */
import type { BaseSyntheticEvent } from "react";
import type {
  UseFormProps as __UseFormProps,
  DefaultValues,
  FieldValues,
  KeepStateOptions,
  SubmitHandler,
  UseFormReset,
  UseFormReturn,
} from "react-hook-form";
import type { z, ZodSchema } from "zod";
import { useCallback, useEffect, useRef } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import _ from "lodash";
import { useForm as __useForm, useWatch } from "react-hook-form";

import type { ResetAction } from "../types";

type FormInstance<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
> = UseFormReturn<TFieldValues, TContext, TTransformedValues> & {
  schema: ZodSchema | undefined;
  defaultValues: UseFormProps<
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
  TTransformedValues extends FieldValues | undefined = undefined,
> = __UseFormProps<TFieldValues, TContext, TTransformedValues> & {
  schema?: z.ZodSchema<TTransformedValues, any, TFieldValues>;
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
  const { schema, defaultValues, ...restProps } = props ?? {};

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
  const submit = useCallback(
    (event?: BaseSyntheticEvent<object, unknown, unknown>) => {
      return props
        ? methods.handleSubmit(props.onSubmit ?? ((() => void 0) as any))(event)
        : Promise.resolve();
    },
    [methods, props],
  );

  const _formControl =
    useRef<FormInstance<TFieldValues, TContext, TTransformedValues>>(null);

  _formControl.current ??= {
    ...methods,
    schema,
    defaultValues,
    submit,
    resetFields,
    setFieldsValue,
  };

  // onValuesChange
  // has onValuesChange
  // form has values
  // values not same defaultValues
  const control = _formControl.current.control;
  const w = useWatch<TFieldValues, TTransformedValues>({
    control,
  });
  useEffect(() => {
    if (
      props?.onValuesChange &&
      !_.isEqual(_formControl.current?.formState.defaultValues, w) &&
      Object.keys(w).length > 0
    ) {
      props.onValuesChange(
        getChangedValues(
          _formControl.current?.formState.defaultValues,
          w,
        ) as TFieldValues,
        w as TFieldValues,
      );
    }
  }, [w, _formControl.current.formState.defaultValues, props]);

  return _formControl.current;
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

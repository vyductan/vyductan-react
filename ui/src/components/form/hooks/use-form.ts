/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  FieldPath,
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
  validateFields: (
    nameList?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[],
  ) => Promise<DeepPartial<TFieldValues>>;
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

type ErrorField = { name: string[]; errors: string[] };

class ValidateFieldsError<TFieldValues> extends Error {
  values: DeepPartial<TFieldValues>;
  errorFields: ErrorField[];

  constructor(
    message: string,
    values: DeepPartial<TFieldValues>,
    errorFields: ErrorField[],
  ) {
    super(message);
    this.name = "ValidateFieldsError";
    this.values = values;
    this.errorFields = errorFields;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
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

  const validateFields = useCallback(
    async (
      nameList?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[],
    ): Promise<DeepPartial<TFieldValues>> => {
      const names = Array.isArray(nameList)
        ? nameList
        : nameList
          ? [nameList]
          : undefined;

      const isValid = await methods.trigger(names as any);

      if (isValid) {
        return methods.getValues() as unknown as DeepPartial<TFieldValues>;
      }

      // Build AntD-like errorFields
      const buildErrorFields = (obj: unknown, path: string[] = []) => {
        const acc: { name: string[]; errors: string[] }[] = [];
        if (!obj || typeof obj !== "object") return acc;
        for (const [key, value] of Object.entries(
          obj as Record<string, unknown>,
        )) {
          const nextPath = [...path, key];
          if (value && typeof value === "object") {
            // FieldError has message; nested errors are objects
            const maybeMsg = (value as { message?: unknown }).message;
            if (typeof maybeMsg === "string" && maybeMsg) {
              acc.push({ name: nextPath, errors: [maybeMsg] });
            }
            const children = buildErrorFields(value, nextPath);
            if (children.length > 0) acc.push(...children);
          }
        }
        return acc;
      };

      const errorFieldsAll = buildErrorFields(methods.formState.errors);
      const errorFields = names
        ? errorFieldsAll.filter((e) =>
            names.some((n) => e.name.join(".") === String(n)),
          )
        : errorFieldsAll;

      // Focus first error field if possible
      if (errorFields.length > 0) {
        const firstError = errorFields[0];
        if (firstError) {
          methods.setFocus(firstError.name.join(".") as any);
        }
      }

      const values =
        methods.getValues() as unknown as DeepPartial<TFieldValues>;
      throw new ValidateFieldsError<TFieldValues>(
        "Validation failed",
        values,
        errorFields,
      );
    },
    [methods],
  );

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
    validateFields,
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
  _formControl.current.validateFields = validateFields;

  return _formControl.current;
};

export { useForm, ValidateFieldsError };
export type { UseFormProps, FormInstance };

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
import { useEffect, useState } from "react";
import { useForm as useRHForm } from "react-hook-form";

type FormInstance<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
> = UseFormReturn<TFieldValues, TContext, TTransformedValues> & {
  submit: (
    e?: BaseSyntheticEvent<object, any, any> | undefined,
  ) => Promise<void>;
  defaultValues?: UseRHFormProps<TFieldValues>["defaultValues"];
  _setFormInstance: (
    newFormInstance: FormInstance<TFieldValues, TContext, TTransformedValues>,
  ) => void;
};

type UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
> = UseRHFormProps<TFieldValues, TContext> & {
  onSubmit?: TTransformedValues extends FieldValues
    ? SubmitHandler<TTransformedValues>
    : SubmitHandler<TFieldValues>;
};
const useForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>(
  props?: UseFormProps<TFieldValues, TContext, TTransformedValues>,
) => {
  const methods = useRHForm<TFieldValues, TContext, TTransformedValues>();
  const [formInstance, setFormInstance] = useState<
    FormInstance<TFieldValues, TContext, TTransformedValues>
  >({
    ...methods,
    defaultValues: props?.defaultValues,

    submit: () => new Promise(() => void 0),
    _setFormInstance: () => void 0,
  });

  useEffect(() => {
    if (formInstance.defaultValues === undefined) return;

    const defaultValues = formInstance.defaultValues;
    if (typeof defaultValues !== "function") {
      formInstance.reset(defaultValues);
    } else {
      defaultValues().then((value) => {
        formInstance.reset(value);
      });
    }
  }, [formInstance.defaultValues]);

  const _setFormInstance = (
    newFormInstance: FormInstance<TFieldValues, TContext, TTransformedValues>,
  ) => {
    if (String(formInstance.submit) === String(newFormInstance.submit)) return;
    setFormInstance(newFormInstance);
  };
  return { ...formInstance, _setFormInstance };
};

export { useForm };
export type { UseFormProps, FormInstance };

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ReactNode } from "react";
import type { DefaultValues, FieldErrors, FieldValues } from "react-hook-form";
import React from "react";

import type { FormRootProps } from "./_components/form-root";
// import type { FormBaseProps, FormContextValue } from "./context";
import type { FormInstance, UseFormProps } from "./hooks/use-form";
import { useComponentConfig } from "../config-provider/context";
import { FormProvider } from "./_components/form-root";
import { useForm } from "./hooks/use-form";

type ErrorField = { name: string[]; errors: string[] };

type OnFinishFailedErrorInfo<TFieldValues extends FieldValues = FieldValues> = {
  values: TFieldValues;
  errorFields: ErrorField[];
  outOfDate: boolean;
};

type FormConfigProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = Omit<UseFormProps<TFieldValues, TContext, TTransformedValues>, "onSubmit"> &
  Omit<
    React.DetailedHTMLProps<
      React.FormHTMLAttributes<HTMLFormElement>,
      HTMLFormElement
    >,
    "children" | "onSubmit"
  > & {
    form?: never;
    initialValues?: DefaultValues<TFieldValues>;
    onFinish?: (values: TFieldValues) => void | Promise<void>;
    onFinishFailed?: (errorInfo: OnFinishFailedErrorInfo<TFieldValues>) => void;
  };

type WithFormProp<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = {
  form: FormInstance<TFieldValues, TContext, TTransformedValues>;

  onFinish?: never;
  onFinishFailed?: never;
} & Omit<
  React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >,
  "children"
>;

type FormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = Pick<
  FormRootProps<TFieldValues, TContext, TTransformedValues>,
  | "layout"
  | "labelAlign"
  | "labelCol"
  | "labelWrap"
  | "wrapperCol"
  | "colon"
  | "classNames"
> &
  (
    | (FormConfigProps<TFieldValues, TContext, TTransformedValues> & {
        children: ReactNode;
      })
    | (WithFormProp<TFieldValues, TContext, TTransformedValues> & {
        children: ReactNode;
      })
  );

const Form = <
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues = TFieldValues,
>({
  id: idProps,
  form,
  layout: layoutProp,
  labelAlign,
  labelCol,
  labelWrap,
  wrapperCol,
  colon: colonProp,
  classNames,
  children,
  ...props
}: FormProps<TFieldValues, TContext, TTransformedValues>) => {
  const generatedId = React.useId();
  const id = idProps ?? generatedId;

  const { layout: layoutConfig, colon: colonConfig } =
    useComponentConfig("form");

  const layout = layoutProp ?? layoutConfig ?? "horizontal";
  const colon =
    colonProp ?? (layout === "vertical" ? false : (colonConfig ?? true));

  if (form) {
    return (
      <FormProvider<TFieldValues, TContext, TTransformedValues>
        id={id}
        form={form}
        layout={layout}
        labelAlign={labelAlign}
        labelCol={labelCol}
        labelWrap={labelWrap}
        wrapperCol={wrapperCol}
        colon={colon}
        classNames={classNames}
      >
        <form id={id} onSubmit={form.submit} {...props}>
          {children}
        </form>
      </FormProvider>
    );
  }

  return (
    <FormWithoutFormProp
      id={id}
      layout={layout}
      labelAlign={labelAlign}
      labelCol={labelCol}
      labelWrap={labelWrap}
      wrapperCol={wrapperCol}
      colon={colon}
      classNames={classNames}
      {...props}
    >
      {children}
    </FormWithoutFormProp>
  );
};

const FormWithoutFormProp = <
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues = TFieldValues,
>(
  props: FormConfigProps<TFieldValues, TContext, TTransformedValues> &
    Pick<
      FormRootProps<TFieldValues, TContext, TTransformedValues>,
      | "id"
      | "layout"
      | "labelAlign"
      | "labelCol"
      | "labelWrap"
      | "wrapperCol"
      | "colon"
      | "classNames"
    > & {
      children: ReactNode;
    },
) => {
  const {
    id,
    initialValues,
    onFinish,
    onFinishFailed,
    layout,
    labelAlign,
    labelCol,
    labelWrap,
    wrapperCol,
    colon,
    classNames,
    children,
    schema,
    defaultValues,
    mode,
    reValidateMode,
    resolver,
    context,
    criteriaMode,
    shouldFocusError,
    shouldUnregister,
    shouldUseNativeValidation,
    progressive,
    delayError,
    disabled,
    resetOptions,
    values,
    errors,
    onValuesChange,
    ...htmlFormProps
  } = props;

  // Build error fields from react-hook-form errors
  const buildErrorFields = (
    errors: FieldErrors<TFieldValues>,
  ): ErrorField[] => {
    const result: ErrorField[] = [];
    const traverse = (obj: Record<string, unknown>, path: string[] = []) => {
      for (const [key, value] of Object.entries(obj)) {
        const nextPath = [...path, key];
        if (value && typeof value === "object") {
          const maybeMsg = (value as { message?: unknown }).message;
          if (typeof maybeMsg === "string" && maybeMsg) {
            result.push({ name: nextPath, errors: [maybeMsg] });
          }
          traverse(value as Record<string, unknown>, nextPath);
        }
      }
    };
    traverse(errors as Record<string, unknown>);
    return result;
  };

  // Wrap onFinish to handle both success and error cases
  const handleFormSubmit = async (data: TTransformedValues) => {
    if (onFinish) {
      await onFinish(data as unknown as TFieldValues);
    }
  };

  // Create form instance with useForm
  const form = useForm<TFieldValues, TContext, TTransformedValues>({
    schema,
    defaultValues: initialValues ?? defaultValues,
    mode,
    reValidateMode,
    resolver,
    context,
    criteriaMode,
    shouldFocusError,
    shouldUnregister,
    shouldUseNativeValidation,
    progressive,
    delayError,
    disabled,
    resetOptions,
    values,
    errors,
    onValuesChange,
    onSubmit: handleFormSubmit,
  });

  // Wrap form submit to handle onFinishFailed
  const handleSubmit = (e?: React.BaseSyntheticEvent) => {
    if (onFinishFailed) {
      return form.handleSubmit(
        handleFormSubmit,
        (errors: FieldErrors<TFieldValues>) => {
          const errorFields = buildErrorFields(errors);
          const values = form.getValues();
          onFinishFailed({
            values,
            errorFields,
            outOfDate: false,
          });
        },
      )(e);
    }
    return form.submit(e);
  };

  return (
    <FormProvider<TFieldValues, TContext, TTransformedValues>
      id={id}
      {...form}
      layout={layout}
      labelAlign={labelAlign}
      labelCol={labelCol}
      labelWrap={labelWrap}
      wrapperCol={wrapperCol}
      colon={colon}
      classNames={classNames}
    >
      <form id={id} onSubmit={handleSubmit} {...htmlFormProps}>
        {children}
      </form>
    </FormProvider>
  );
};

export { Form };
export type { FormProps, OnFinishFailedErrorInfo };

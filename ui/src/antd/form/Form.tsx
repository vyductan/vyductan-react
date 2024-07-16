"use client";

import type { FormProps as AntdFormProps } from "antd";
import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";
import { Form as AntdForm } from "antd";
import { FormProvider } from "react-hook-form";

import type { FormInstance } from "./useForm";

// const x: AntdFormProps;
// x.fields
type FormProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues | undefined = undefined,
> = Omit<AntdFormProps, "form" | "children" | "fields"> & {
  form: FormInstance<TFieldValues, TContext, TTransformedValues>;
  children:
    | ReactNode
    | ((
        form: FormInstance<TFieldValues, TContext, TTransformedValues>,
      ) => ReactNode);
};
const Form = <
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues = TFieldValues,
>({
  form,
  children,
  ...restProps
}: FormProps<TFieldValues, TContext, TTransformedValues>) => {
  return (
    <FormProvider {...form}>
      <AntdForm layout="vertical" onFinish={form.submit} {...restProps}>
        {typeof children === "function" ? children(form) : children}
      </AntdForm>
    </FormProvider>
  );
};

export { Form };
export type { FormProps };

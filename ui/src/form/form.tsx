"use client";

import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";

import type { FormInstance } from "./use-form";
import { FormProvider } from "./context";
import { FormErrorsNotification } from "./form-errors-notification";

type FormProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues = TFieldValues,
> = Omit<
  React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >,
  "children"
> & {
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
      <form onSubmit={form.submit} {...restProps}>
        {typeof children === "function" ? children(form) : children}
      </form>
      <FormErrorsNotification />
    </FormProvider>
  );
};

export { Form };
export type { FormProps };

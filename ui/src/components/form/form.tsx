"use client";

import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";

import type { FormInstance } from "./hooks/use-form";
import { FormErrorsNotification } from "./_components/form-errors-notification";
import { FormProvider } from "./context";

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
  layout?: "vertical" | "horizontal";
  classNames?: {
    label?: string;
  }
};
const Form = <
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues = TFieldValues,
>({
  form,
  children,
  layout,
  classNames,
  ...restProps
}: FormProps<TFieldValues, TContext, TTransformedValues>) => {
  return (
    <FormProvider {...form} layout={layout} classNames={classNames}>
      <form onSubmit={form.submit} {...restProps}>
        {typeof children === "function" ? children(form) : children}
      </form>
      <FormErrorsNotification />
    </FormProvider>
  );
};

export { Form };
export type { FormProps };

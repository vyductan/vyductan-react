"use client";

import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";

import type { FormInstance } from "./use-form";
import { FormRoot } from "./context";
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
    <FormRoot {...form}>
      <form onSubmit={form.submit} {...restProps}>
        {typeof children === "function" ? children(form) : children}
      </form>
      <FormErrorsNotification />
    </FormRoot>
  );
};

export { Form };
export type { FormProps };

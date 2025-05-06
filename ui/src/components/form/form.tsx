"use client";

import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";

import type { FormRootProps } from "./_components/form-root";
// import type { FormBaseProps, FormContextValue } from "./context";
import type { FormInstance } from "./hooks/use-form";
import { FormErrorsNotification } from "./_components/form-errors-notification";
import { FormRoot } from "./_components/form-root";
import { useExtraProps } from "./hooks/use-extra-props";

type WithoutFormProp<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues | undefined = undefined,
> = Omit<
  FormInstance<TFieldValues, TContext, TTransformedValues>,
  "resetFields" | "setFieldsValue" | "submit"
> & {
  form: never;
};

type WithFormProp<
  TFieldValues extends FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
> = {
  form: FormInstance<TFieldValues, TContext, TTransformedValues>;
} & Omit<
  React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >,
  "children"
>;
type FormProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues = TFieldValues,
> = Pick<
  FormRootProps<TFieldValues, TContext, TTransformedValues>,
  "layout" | "classNames"
> &
  (
    | WithoutFormProp<TFieldValues, TContext, TTransformedValues>
    | WithFormProp<TFieldValues, TContext, TTransformedValues>
  ) & {
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
  layout,
  classNames,
  // ...restProps
  ...props
}: FormProps<TFieldValues, TContext, TTransformedValues>) => {
  if (
    "formState" in props &&
    children &&
    typeof children === "object" &&
    "type" in children &&
    children.type === "form"
  ) {
    return <FormWithoutFormProp {...props} />;
  }

  return (
    <FormRoot<TFieldValues, TContext, TTransformedValues>
      {...form}
      layout={layout}
      classNames={classNames}
    >
      <form onSubmit={form.submit} {...props}>
        {typeof children === "function" ? children(form) : children}
      </form>
      <FormErrorsNotification />
    </FormRoot>
  );
};

const FormWithoutFormProp = <
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues = TFieldValues,
>(
  props: Omit<
    WithoutFormProp<TFieldValues, TContext, TTransformedValues>,
    "form"
  > &
    React.DetailedHTMLProps<
      React.FormHTMLAttributes<HTMLFormElement>,
      HTMLFormElement
    >,
) => {
  const { setFieldsValue, resetFields } = useExtraProps({
    defaultValues: props.defaultValues,
    reset: props.reset,
    handleSubmit: props.handleSubmit,
  });

  return (
    <FormRoot<TFieldValues, TContext, TTransformedValues>
      children={undefined}
      {...props}
      setFieldsValue={setFieldsValue}
      resetFields={resetFields}
      submit={props.onSubmit ?? ((() => void 0) as any)}
    />
  );
};

export { Form };
export type { FormProps };

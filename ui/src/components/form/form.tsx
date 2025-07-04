"use client";

import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";

import type { FormRootProps } from "./_components/form-root";
// import type { FormBaseProps, FormContextValue } from "./context";
import type { FormInstance } from "./hooks/use-form";
import { FormRoot } from "./_components/form-root";
import { useExtraProps } from "./hooks/use-extra-props";

type WithoutFormProp<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = Omit<
  FormInstance<TFieldValues, TContext, TTransformedValues>,
  "resetFields" | "setFieldsValue" | "submit"
> & {
  form?: never;
};

type WithFormProp<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
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
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = Pick<
  FormRootProps<TFieldValues, TContext, TTransformedValues>,
  "layout" | "classNames"
> &
  (
    | WithoutFormProp<TFieldValues, TContext, TTransformedValues>
    | WithFormProp<TFieldValues, TContext, TTransformedValues>
  ) & {
    children: ReactNode;
  };

const Form = <
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues = TFieldValues,
>({
  form,
  layout,
  classNames,
  // ...restProps
  ...props
}: FormProps<TFieldValues, TContext, TTransformedValues>) => {
  // if (
  //   "formState" in props &&
  //   children &&
  //   typeof children === "object" &&
  //   "type" in children &&
  //   children.type === "form"
  // ) {
  //   return <FormWithoutFormProp {...props} />;
  // }

  if (form) {
    return (
      <FormRoot<TFieldValues, TContext, TTransformedValues>
        {...form}
        layout={layout}
        classNames={classNames}
      >
        <form onSubmit={form.submit} {...props} />
      </FormRoot>
    );
  }
  if ("formState" in props) {
    return <FormWithoutFormProp {...props} />;
  }

  return null;
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
    Omit<
      React.DetailedHTMLProps<
        React.FormHTMLAttributes<HTMLFormElement>,
        HTMLFormElement
      >,
      "children"
    > & {
      children: ReactNode;
    },
) => {
  const { setFieldsValue, resetFields } = useExtraProps({
    defaultValues: props.defaultValues,
    reset: props.reset,
    handleSubmit: props.handleSubmit,
  });

  return (
    <FormRoot<TFieldValues, TContext, TTransformedValues>
      {...props}
      setFieldsValue={setFieldsValue}
      resetFields={resetFields}
      submit={props.onSubmit ?? ((() => void 0) as any)}
    />
  );
};

export { Form };
export type { FormProps };

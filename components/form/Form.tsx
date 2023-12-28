"use client";

import { useEffect, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  type FieldValues,
  type SubmitHandler,
} from "react-hook-form";
import { type z, type ZodTypeDef } from "zod";

import { useForm, type FormInstance, type UseFormProps } from "./useForm";

type FormProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues | undefined = undefined,
> = {
  form?: FormInstance<TFieldValues, TContext, TTransformedValues>;
  defaultValues?: UseFormProps<TFieldValues>["defaultValues"];
  children:
    | ReactNode
    | ((
        form: FormInstance<TFieldValues, TContext, TTransformedValues>,
      ) => ReactNode);
  validationSchema?: z.Schema<unknown, ZodTypeDef>;
  onSubmit?: TTransformedValues extends FieldValues
    ? SubmitHandler<TTransformedValues>
    : SubmitHandler<TFieldValues>;
};
const Form = <
  TValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  form: formInstanceExternal,
  defaultValues,
  children,
  validationSchema,
  onSubmit,
}: FormProps<TValues, TContext, TTransformedValues>) => {
  const formInstance = useForm<TValues, TContext, TTransformedValues>({
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    defaultValues,
  });

  useEffect(() => {
    if (formInstanceExternal && onSubmit) {
      formInstanceExternal._setFormInstance({
        ...formInstance,
        submit: formInstance.handleSubmit(onSubmit),
      });
    }
  }, [formInstanceExternal, onSubmit]);

  return (
    <FormProvider {...formInstance}>
      <form
        onSubmit={onSubmit ? formInstance.handleSubmit(onSubmit) : undefined}
      >
        {typeof children === "function" ? children(formInstance) : children}
      </form>
    </FormProvider>
  );
};

export { Form };
export type { FormProps };

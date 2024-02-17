"use client";

import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";
import { FormProvider } from "react-hook-form";

import type { FormInstance } from "./useForm";

/*
 *
 * https://dev.to/maissenayed/conditional-react-props-with-typescript-43lg
 */
// type BaseFormProps<
//   TFieldValues extends FieldValues,
//   TContext,
//   TTransformedValues extends FieldValues | undefined = undefined,
// > = {
//   children:
//     | ReactNode
//     | ((
//         form: FormInstance<TFieldValues, TContext, TTransformedValues>,
//       ) => ReactNode);
// };
// type WithFormProps<
//   TFieldValues extends FieldValues,
//   TContext,
//   TTransformedValues extends FieldValues | undefined = undefined,
// > = {
//   form: FormInstance<TFieldValues, TContext, TTransformedValues>;
// } & BaseFormProps<TFieldValues, TContext, TTransformedValues>;
// type WithOutFormProps<
//   TFieldValues extends FieldValues,
//   TContext,
//   TTransformedValues extends FieldValues | undefined = undefined,
// > = {
//   form?: never;
//   defaultValues?: UseFormProps<TFieldValues>["defaultValues"];
//
//   validationSchema?: z.Schema<unknown, ZodTypeDef>;
//   onSubmit?: TTransformedValues extends FieldValues
//     ? SubmitHandler<TTransformedValues>
//     : SubmitHandler<TFieldValues>;
// } & BaseFormProps<TFieldValues, TContext, TTransformedValues>;
// type FormProps<
//   TFieldValues extends FieldValues,
//   TContext,
//   TTransformedValues extends FieldValues | undefined = undefined,
// > =
//   | WithFormProps<TFieldValues, TContext, TTransformedValues>
//   | WithOutFormProps<TFieldValues, TContext, TTransformedValues>;

type FormProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues = TFieldValues,
> = {
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
}: FormProps<TFieldValues, TContext, TTransformedValues>) => {
  //   {
  //   form: formInstanceExternal,
  //   defaultValues,
  //   children,
  //   validationSchema,
  //   onSubmit,
  // }
  // if (isWithoutUseForm(props)) {
  //   props.form;
  //   // if ((props as WithFormProps<TValues, TContext, TTransformedValues>).form !== undefined) {
  //   //   const { form } = props as WithFormProps<TValues, TContext, TTransformedValues>;
  //   //   // return <FormProvider {...form} />;
  //   // }
  // }

  // const formInstance = useForm<TValues, TContext, TTransformedValues>(
  //   (() => {
  //     if (isWithoutUseForm(props)) {
  //       return {
  //         defaultValues: props.defaultValues,
  //         resolver: props.validationSchema
  //           ? zodResolver(props.validationSchema)
  //           : undefined,
  //         // ...props
  //       };
  //     }
  //     return undefined;
  //   })(),
  // );

  // let onSubmit = formInstance.submit;
  //
  // if (form) {
  //   onSubmit = form.submit;
  // }

  // useEffect(() => {
  //   if (form && onSubmit) {
  //     formInstanceExternal._setFormInstance({
  //       ...formInstance,
  //       submit: formInstance.handleSubmit(onSubmit),
  //     });
  //   }
  // }, [formInstanceExternal, onSubmit]);

  return (
    <FormProvider {...form}>
      {/* <FormProvider {...formInstance}> */}
      <form
        // onSubmit={onSubmit ? formInstance.handleSubmit(onSubmit) : undefined}
        onSubmit={form.submit}
      >
        {typeof children === "function" ? children(form) : children}
      </form>
    </FormProvider>
  );
};

// const isWithoutUseForm = <
//   TFieldValues extends FieldValues,
//   TContext,
//   TTransformedValues extends FieldValues | undefined = undefined,
// >(
//   props: FormProps<TFieldValues, TContext, TTransformedValues>,
// ): props is WithOutFormProps<TFieldValues, TContext, TTransformedValues> => {
//   return (
//     (props as WithOutFormProps<TFieldValues, TContext, TTransformedValues>)
//       .form === undefined
//   );
// };

export { Form };
export type { FormProps };

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldValues } from "react-hook-form";
import { FormProvider as RHFormProvider } from "react-hook-form";

import type { FormProviderProps } from "../context";
import { FormContext } from "../context";
import { FormErrorsNotification } from "./form-errors-notification";

// type FormProviderProps=
const FormProvider = <
  TFieldValues extends FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  children,
  ...props
}: FormProviderProps<TFieldValues, TContext, TTransformedValues>) => {
  return (
    <FormContext.Provider
      value={
        props as unknown as FormProviderProps<FieldValues, any, FieldValues>
      }
    >
      {props.form ? (
        <RHFormProvider {...props.form}>{children}</RHFormProvider>
      ) : (
        children
      )}
      <FormErrorsNotification />
    </FormContext.Provider>
  );
};

export { FormProvider };

export {
  type FormProviderProps,
  type FormProviderProps as FormRootProps,
} from "../context";

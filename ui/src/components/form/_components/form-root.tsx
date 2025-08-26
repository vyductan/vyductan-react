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
      <RHFormProvider {...props}>{children}</RHFormProvider>
      <FormErrorsNotification />
    </FormContext.Provider>
  );
};

const FormRoot = FormProvider;

export { FormRoot };

export {
  type FormProviderProps,
  type FormProviderProps as FormRootProps,
} from "../context";

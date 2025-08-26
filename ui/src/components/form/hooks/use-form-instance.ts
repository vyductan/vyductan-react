import type { FieldValues } from "react-hook-form";
import * as React from "react";

import type { FormProviderProps } from "../context";
import type { FormInstance } from "./use-form";
import { FormContext } from "../context";

export function useFormInstance<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>(): FormInstance<TFieldValues, TContext, TTransformedValues> {
  const { form } = React.useContext(
    FormContext as unknown as React.Context<
      FormProviderProps<TFieldValues, TContext, TTransformedValues>
    >,
  );

  return form!;
}

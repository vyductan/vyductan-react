import type { FieldValues, SubmitHandler } from "react-hook-form";

export type ValueType = string | number | boolean;

export type FieldError = {
  path: string[];
  message: string;
};

export type ResetAction<TFieldValues> = (
  formValues: TFieldValues,
) => TFieldValues;

export { type SubmitHandler } from "react-hook-form";

export type OnSubmit<
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues extends FieldValues | undefined = undefined,
> = TTransformedValues extends undefined
  ? SubmitHandler<TFieldValues>
  : TTransformedValues extends FieldValues
    ? SubmitHandler<TTransformedValues>
    : never;

export type FormLayout = "horizontal" | "vertical";

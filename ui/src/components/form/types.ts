export type ValueType = string | number | boolean;

export type FieldError = {
  path: string[];
  message: string;
};

export type ResetAction<TFieldValues> = (
  formValues: TFieldValues,
) => TFieldValues;

export { type SubmitHandler } from "react-hook-form";

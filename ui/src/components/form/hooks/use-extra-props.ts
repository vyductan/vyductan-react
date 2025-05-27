import type { BaseSyntheticEvent } from "react";
import type {
  DefaultValues,
  FieldValues,
  KeepStateOptions,
} from "react-hook-form";
import { useCallback } from "react";

import type { FormInstance } from "../hooks/use-form";
import type { OnSubmit, ResetAction } from "../types";

export const useExtraProps = <
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues,
>({
  defaultValues,
  handleSubmit,
  onSubmit,
  reset,
}: Pick<
  FormInstance<TFieldValues, TContext, TTransformedValues>,
  "defaultValues" | "reset" | "handleSubmit"
> & {
  onSubmit?: OnSubmit<TFieldValues, TTransformedValues>;
}) => {
  const resetFields = useCallback(
    (keepStateOptions?: KeepStateOptions) => {
      if (typeof defaultValues === "object") {
        reset(defaultValues, keepStateOptions);
      } else if (typeof defaultValues === "function") {
        defaultValues()
          .then((values: TFieldValues) => {
            reset(values, keepStateOptions);
          })
          .catch(() => void 0);
      } else {
        reset(defaultValues, keepStateOptions);
      }
    },
    [defaultValues, reset],
  );
  const setFieldsValue = useCallback(
    (
      values?:
        | DefaultValues<TFieldValues>
        | TFieldValues
        | ResetAction<TFieldValues>,
      keepStateOptions?: KeepStateOptions,
    ) => {
      reset(values, {
        keepDefaultValues: true,
        ...keepStateOptions,
      });
    },
    [reset],
  );
  const submit = useCallback(
    (event?: BaseSyntheticEvent<object, unknown, unknown>) => {
      return onSubmit ? handleSubmit(onSubmit)(event) : Promise.resolve();
    },
    [handleSubmit, onSubmit],
  );

  return {
    resetFields,
    setFieldsValue,
    submit,
  };
};

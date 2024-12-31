"use client";

import type { ReactElement } from "react";
import type {
  Control,
  FieldArrayPath,
  FieldValues,
  UseFieldArrayReturn,
} from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import { useFormContext } from "./context";
import { Field } from "./field";
import { useFieldOptionalityCheck } from "./use-field-optionality-check";

type FieldListProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends
    FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
> = {
  control?: Control<TFieldValues>;
  name: TFieldArrayName;
  label?: string;
  description?: string;
  required?: boolean;
  children?: (
    ctx: Omit<
      UseFieldArrayReturn<TFieldValues, TFieldArrayName, "id">,
      "fields"
    > & {
      fields: {
        id: string;
        name: string;
      }[];
    },
  ) => ReactElement<any>;
};
const FieldList = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends
    FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  children,
}: FieldListProps<TFieldValues, TFieldArrayName>) => {
  const { fields: defaultValues, ...helper } = useFieldArray<
    TFieldValues,
    TFieldArrayName
  >({
    control,
    name,
  });
  const fields = defaultValues.map((value, index) => {
    return {
      id: value.id,
      name: `${name}.${index}`,
    };
  });
  const ctx = {
    fields,
    ...helper,
  };

  const form = useFormContext<TFieldValues>();
  const isOptional = useFieldOptionalityCheck(name, form?.schema);

  return (
    <Field
      label={label}
      description={description}
      required={required ?? (isOptional === undefined ? false : !isOptional)}
    >
      {children?.(ctx)}
    </Field>
  );
};

export { FieldList };
export type { FieldListProps as FieldArrayProps };

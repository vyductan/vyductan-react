"use client";

import type { ReactElement } from "react";
import type {
  Control,
  FieldArray,
  FieldArrayPath,
  FieldValues,
  UseFieldArrayReturn,
} from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import { useFormContext } from "../context";
import { useFieldOptionalityCheck } from "../hooks/use-field-optionality-check";
import { Field } from "./form-field";

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
    fields: {
      id: string;
      key: string;
      name: string;
    }[],
    ctx: Omit<
      UseFieldArrayReturn<TFieldValues, TFieldArrayName, "id">,
      "fields" | "remove"
    > & {
      add: (
        defaultValue?:
          | FieldArray<TFieldValues, TFieldArrayName>
          | FieldArray<TFieldValues, TFieldArrayName>[],
        insertIndex?: number,
      ) => void;
      remove: (fieldName: string) => void;
      move: (from: number, to: number) => void;
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
      key: value.id,
      name: `${name}.${index}`,
    };
  });

  const add = (
    defaultValue?:
      | FieldArray<TFieldValues, TFieldArrayName>
      | FieldArray<TFieldValues, TFieldArrayName>[],
    insertIndex?: number,
  ) => {
    if (typeof insertIndex === "number") {
      helper.insert(insertIndex, defaultValue ?? ({} as any));
    } else {
      helper.append(defaultValue ?? ({} as any));
    }
  };

  const remove = (fieldName: string) => {
    const index = fields.findIndex((field) => field.name === fieldName);
    if (index === -1) return;
    helper.remove(index);
  };
  const move = (from: number, to: number) => {
    if (from < 0 || from >= fields.length || to < 0 || to >= fields.length) {
      return;
    }
    helper.move(from, to);
  };

  const ctx = {
    ...helper,
    add,
    remove,
    move,
    errors: control?._formState.errors[name],
  };

  const form = useFormContext<TFieldValues>();
  const isOptional = useFieldOptionalityCheck(name, form?.schema);

  return (
    <Field
      label={label}
      description={description}
      required={required ?? (isOptional === undefined ? false : !isOptional)}
    >
      {children?.(fields, ctx)}
    </Field>
  );
};

export { FieldList };
export type { FieldListProps as FieldArrayProps };

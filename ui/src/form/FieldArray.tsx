"use client";

import type { ReactNode } from "react";
import type { FieldValues, UseFieldArrayReturn } from "react-hook-form";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Field } from "./Field";

type FieldArrayProps = {
  name: string;
  label?: string;
  description?: string;
  children?: (
    fieldArray: UseFieldArrayReturn<FieldValues, string, "id">,
  ) => ReactNode;
};
const FieldArray = ({
  name,
  label,
  description,
  children,
}: FieldArrayProps) => {
  const { control } = useFormContext();
  const fieldArray = useFieldArray({
    control,
    name,
  });
  return (
    <Field
      control={control}
      name={name}
      label={label}
      description={description}
    >
      {() => (
        <div className="mt-2 rounded-md bg-gray-200 p-6 dark:bg-gray-900/80">
          {children?.(fieldArray)}
        </div>
      )}
    </Field>
  );
};

export { FieldArray };
export type { FieldArrayProps };

"use client";

import type React from "react";
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { FormFieldContext } from "../context";

type FormControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  render: ControllerProps<TFieldValues, TName>["render"];
};

function FormController<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ render, ...props }: FormControllerProps<TFieldValues, TName>): React.JSX.Element {
  return (
    <Controller
      {...props}
      render={(context) => (
        <FormFieldContext.Provider value={{ name: context.field.name }}>
          {render(context)}
        </FormFieldContext.Provider>
      )}
    />
  );
}

export type { FormControllerProps };
export { FormController };

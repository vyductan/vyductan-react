"use client";

import type { ReactElement } from "react";
import type {
  ControllerFieldState,
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormStateReturn,
} from "react-hook-form";
import { cloneElement, useId } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, useFormContext } from "react-hook-form";

import { clsm } from "@acme/ui";

import { FormFieldContext } from "./context";
import { FieldDescription } from "./FieldDescription";
import { FormLabel } from "./FieldLabel";
import { FieldMessage } from "./FieldMessage";

export type FieldControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerRenderProps<TFieldValues, TName>;
type FieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, "render"> &
  Required<Pick<ControllerProps<TFieldValues, TName>, "control">> & {
    children?:
      | ReactElement
      | (({
          field,
          fieldState,
          formState,
        }: {
          field: FieldControllerRenderProps<TFieldValues, TName>;
          fieldState: ControllerFieldState;
          formState: UseFormStateReturn<TFieldValues>;
        }) => React.ReactElement);
    label?: string;
    description?: string;
    className?: string;
  };
const Field = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  children,
  description,
  className,
  ...props
}: FieldProps<TFieldValues, TName>) => {
  const id = useId();
  const { getFieldState, formState } = useFormContext();
  const { error } = getFieldState(props.name, formState);

  const fieldId = `${id}-form-item`;
  const fieldDescriptionId = `${id}-form-item-description`;
  const fieldMessageId = `${id}-form-item-message`;

  return (
    <FormFieldContext.Provider
      value={{
        name: props.name,
        id,
        fieldId,
        fieldDescriptionId,
        fieldMessageId,
      }}
    >
      <Controller
        {...props}
        render={({ field, fieldState, formState }) => (
          <div className={clsm("space-y-2", "mb-6", className)}>
            {/* Label */}
            {label && <FormLabel>{label}:</FormLabel>}

            {/* Input */}
            <Slot
              id={fieldId}
              aria-describedby={
                !error
                  ? `${fieldDescriptionId}`
                  : `${fieldDescriptionId} ${fieldMessageId}`
              }
              aria-invalid={!!error}
            >
              {children
                ? typeof children === "function"
                  ? children({
                      field,
                      fieldState,
                      formState,
                    })
                  : cloneElement(children, field)
                : null}
            </Slot>

            {/* Description */}
            {description && (
              <FieldDescription>
                This is your public display name.
              </FieldDescription>
            )}

            {/* Message */}
            <FieldMessage />
          </div>
        )}
      />
    </FormFieldContext.Provider>
  );
};
export { Field };
export type { FieldProps };

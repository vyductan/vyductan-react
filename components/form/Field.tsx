"use client";

import type { ReactElement } from "react";
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  PathValue,
  UseFormStateReturn,
} from "react-hook-form";
import { cloneElement, useId } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, useFormContext } from "react-hook-form";

import { clsm } from "@vyductan/utils";

import { FormFieldContext } from "./context";
import { FieldDescription } from "./FieldDescription";
import { FormLabel } from "./FieldLabel";
import { FieldMessage } from "./FieldMessage";

export type FieldControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerRenderProps<TFieldValues, TName>, "onChange"> & {
  onValueChange: ControllerRenderProps<TFieldValues, TName>["onChange"];
};
type FieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
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
  name: TName;
  label?: string;
  description?: string;
  className?: string;
};
const Field = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  children,
  label,
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
        defaultValue={"" as PathValue<TFieldValues, TName>}
        render={({ field: { onChange, ...field }, fieldState, formState }) => (
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
                      field: { ...field, onValueChange: onChange },
                      fieldState,
                      formState,
                    })
                  : cloneElement(children, {
                      ...field,
                      onValueChange: onChange,
                    })
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
        {...props}
      />
    </FormFieldContext.Provider>
  );
};
export { Field };
export type { FieldProps };

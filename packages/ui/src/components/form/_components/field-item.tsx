"use client";

import React from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import {
  Field as ComposableField,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../field";
import { useFormContext } from "../context";
import { useRequiredFieldCheck } from "../hooks/use-field-optionality-check";
import { FormController } from "./form-controller";

type FieldItemChildProps = {
  onBlur?: (event: unknown) => void;
  onChange?: (event: unknown) => void;
  [key: string]: unknown;
};

type FieldProps<TFieldValues extends FieldValues = FieldValues> = {
  control?: Control<TFieldValues>;
  name?: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactElement<FieldItemChildProps>;
  required?: boolean;
  className?: string;
  valuePropName?: string;
  getValueProps?: (value: unknown) => Record<string, unknown>;
  normalize?: (value: unknown, previousValue: unknown) => unknown;
};

function getFormValue(
  value: unknown,
  previousValue: unknown,
  normalize?: FieldProps["normalize"],
): unknown {
  const nextValue = value === undefined ? null : value;

  if (!normalize) {
    return nextValue;
  }

  const normalizedValue = normalize(nextValue, previousValue);

  if (normalizedValue === undefined) {
    return null;
  }

  return normalizedValue;
}

function Field<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  children,
  required: defaultRequired,
  className,
  valuePropName,
  getValueProps,
  normalize,
}: FieldProps<TFieldValues>): React.JSX.Element {
  const generatedId = React.useId();
  const formContext = useFormContext();
  const form = formContext?.form;
  const formId = formContext?.id;
  const required = useRequiredFieldCheck(name, defaultRequired);
  const inputId = name ? `${formId ?? generatedId}-${name}` : generatedId;
  const finalValuePropName = valuePropName ?? "value";
  const mergedControl = (control ?? form?.control) as
    | Control<TFieldValues>
    | undefined;

  if (!name || !mergedControl) {
    return (
      <ComposableField className={className} data-invalid={false}>
        {label && (
          <FieldLabel htmlFor={inputId} required={required}>
            {label}
          </FieldLabel>
        )}
        {children &&
          React.cloneElement(children, {
            id: inputId,
            ...(name ? { name } : {}),
            "aria-invalid": false,
          })}
        {description && <FieldDescription>{description}</FieldDescription>}
      </ComposableField>
    );
  }

  return (
    <FormController
      control={mergedControl}
      name={name}
      render={({ field, fieldState }) => (
        <ComposableField className={className} data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={inputId} required={required}>
              {label}
            </FieldLabel>
          )}
          {children &&
            React.cloneElement(children, {
              ...field,
              id: inputId,
              name,
              "aria-invalid": fieldState.invalid,
              [finalValuePropName]: field.value,
              ...(getValueProps ? getValueProps(field.value) : {}),
              onBlur: (event: unknown) => {
                children.props.onBlur?.(event);
                field.onBlur();
              },
              onChange: (event: unknown) => {
                children.props.onChange?.(event);
                field.onChange(getFormValue(event, field.value, normalize));
              },
            })}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </ComposableField>
      )}
    />
  );
}

export type { FieldProps };
export { Field };

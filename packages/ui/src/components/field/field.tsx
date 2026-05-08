/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import React from "react";

import { cn } from "@acme/ui/lib/utils";
import {
  Field as ShadField,
  FieldDescription as ShadFieldDescription,
  FieldError as ShadFieldError,
  FieldGroup as ShadFieldGroup,
} from "@acme/ui/shadcn/field";

import { FormController } from "../form/_components/form-controller";
import { useFormContext } from "../form/context";
import { useRequiredFieldCheck } from "../form/hooks/use-field-optionality-check";
import { FieldLabel } from "./field-label";

type FieldProperties = React.ComponentProps<typeof ShadField>;
type FieldDescriptionProperties = React.ComponentProps<
  typeof ShadFieldDescription
>;
type FieldGroupProperties = React.ComponentProps<typeof ShadFieldGroup>;
type FieldErrorProperties = React.ComponentProps<typeof ShadFieldError>;
type FieldChildProps = {
  onBlur?: (event: unknown) => void;
  onChange?: (event: unknown) => void;
  [key: string]: unknown;
};

type SmartFieldProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  FieldProperties,
  "children" | "name"
> & {
  control?: Control<TFieldValues>;
  name?: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  required?: boolean;
  valuePropName?: string;
  getValueProps?: (value: any) => Record<string, unknown>;
  normalize?: (value: any, previousValue: any) => unknown;
};

function getFormValue(
  value: unknown,
  previousValue: unknown,
  normalize?: SmartFieldProps["normalize"],
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

function renderFieldChild(
  children: React.ReactNode,
  properties: FieldChildProps,
): React.ReactNode {
  if (!React.isValidElement<FieldChildProps>(children)) {
    return children;
  }

  return React.cloneElement(children, properties);
}

function Field<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  children,
  required: defaultRequired,
  valuePropName,
  getValueProps,
  normalize,
  className,
  ...properties
}: SmartFieldProps<TFieldValues>): React.JSX.Element {
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
      <ShadField
        className={cn("gap-2", className)}
        data-invalid={false}
        {...properties}
      >
        {label && (
          <FieldLabel htmlFor={inputId} required={required}>
            {label}
          </FieldLabel>
        )}
        {renderFieldChild(children, {
          id: inputId,
          ...(name ? { name } : {}),
          "aria-invalid": false,
        })}
        {description && <FieldDescription>{description}</FieldDescription>}
      </ShadField>
    );
  }

  return (
    <FormController
      control={mergedControl}
      name={name}
      render={({ field, fieldState }) => (
        <ShadField
          className={cn("gap-2", className)}
          data-invalid={fieldState.invalid}
          {...properties}
        >
          {label && (
            <FieldLabel htmlFor={inputId} required={required}>
              {label}
            </FieldLabel>
          )}
          {renderFieldChild(children, {
            ...field,
            id: inputId,
            name,
            "aria-invalid": fieldState.invalid,
            [finalValuePropName]: field.value,
            ...(getValueProps ? getValueProps(field.value) : {}),
            onBlur: (event: unknown) => {
              if (React.isValidElement<FieldChildProps>(children)) {
                children.props.onBlur?.(event);
              }
              field.onBlur();
            },
            onChange: (event: unknown) => {
              if (React.isValidElement<FieldChildProps>(children)) {
                children.props.onChange?.(event);
              }
              field.onChange(getFormValue(event, field.value, normalize));
            },
          })}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </ShadField>
      )}
    />
  );
}

const FieldDescription = ({
  className,
  ...properties
}: FieldDescriptionProperties) => {
  return (
    <ShadFieldDescription
      className={cn("text-xs", className)}
      {...properties}
    />
  );
};

const FieldLegendDescription = ({
  className,
  ...properties
}: FieldDescriptionProperties) => {
  return (
    <FieldDescription className={cn("text-sm", className)} {...properties} />
  );
};

const FieldGroup = ({ className, ...properties }: FieldGroupProperties) => {
  return <ShadFieldGroup className={cn("gap-6", className)} {...properties} />;
};

const FieldError = ({
  className,
  errors,
  children,
  ...properties
}: FieldErrorProperties) => {
  const hasContent =
    Boolean(children) || errors?.some((error) => error?.message);

  if (!hasContent) {
    return (
      <div
        data-slot="field-error"
        className={cn(
          "text-destructive min-h-6 text-sm font-normal",
          className,
        )}
        {...properties}
      />
    );
  }

  return (
    <ShadFieldError
      className={cn("min-h-6", className)}
      errors={errors}
      {...properties}
    >
      {children}
    </ShadFieldError>
  );
};

export type { SmartFieldProps as FieldProps };
export {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegendDescription,
};

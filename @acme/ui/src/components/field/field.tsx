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

import useSize from "../config-provider/hooks/use-size";

import { FormController } from "../form/_components/form-controller";
import { useFormContext } from "../form/context";
import { buildFieldChildProps } from "../form/field-binding";
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
  // Only TFieldValues (used to infer `name`) is pinned; TContext/TTransformedValues
  // are left open so `form.control` from a zod schema with `.default()`/`.optional()`
  // (where input type ≠ output type, so TTransformedValues ≠ TFieldValues) is accepted.
  control?: Control<TFieldValues, any, any>;
  name?: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Persistent helper text rendered below the error (AntD `extra`). Unlike
   * `description`, it stays put when a validation error appears. */
  extra?: React.ReactNode;
  children?: React.ReactNode;
  required?: boolean;
  valuePropName?: string;
  getValueProps?: (value: any) => Record<string, unknown>;
  normalize?: (value: any, previousValue: any) => unknown;
};

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
  extra,
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
  const mergedControl = (control ?? form?.control) as
    | Control<TFieldValues>
    | undefined;

  // Tighten the label/control/description spacing at the small size; middle and
  // large keep the current gap-2.
  const size = useSize();
  const fieldGap = size === "small" ? "gap-1.5" : "gap-2";

  if (!name || !mergedControl) {
    return (
      <ShadField
        className={cn(fieldGap, className)}
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
        {extra && <FieldDescription>{extra}</FieldDescription>}
      </ShadField>
    );
  }

  return (
    <FormController
      control={mergedControl}
      name={name}
      render={({ field, fieldState }) => (
        <ShadField
          className={cn(fieldGap, className)}
          data-invalid={fieldState.invalid}
          {...properties}
        >
          {label && (
            <FieldLabel htmlFor={inputId} required={required}>
              {label}
            </FieldLabel>
          )}
          {renderFieldChild(
            children,
            buildFieldChildProps({
              field,
              id: inputId,
              name,
              invalid: fieldState.invalid,
              valuePropName,
              getValueProps,
              normalize,
              childProps: React.isValidElement<FieldChildProps>(children)
                ? children.props
                : undefined,
            }),
          )}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          {extra && <FieldDescription>{extra}</FieldDescription>}
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

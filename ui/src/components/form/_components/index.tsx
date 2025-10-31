"use client";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Export all Field components from shadcn with ShadcnField prefix
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import React from "react";
import { Controller } from "react-hook-form";

import type { ColProps } from "../../grid";
import type { FormLabelAlign, FormLayout } from "../types";
import type { Rule } from "../utils";
import { useFormContext } from "../context";
import { useRequiredFieldCheck } from "../hooks/use-field-optionality-check";
import { FormItemRow } from "./form-item-row";

type FormItemProps<TFieldValues extends FieldValues = FieldValues> = {
  control?: Control<TFieldValues>;

  name?: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactElement<{
    onBlur?: (event: any) => void;
    onChange?: (event: any) => void;
    [key: string]: any;
  }>;

  required?: boolean;

  className?: string;
  layout?: FormLayout;
  colon?: boolean;
  labelCol?: ColProps;
  labelAlign?: FormLabelAlign;
  labelWrap?: boolean;
  wrapperCol?: ColProps;

  valuePropName?: string;
  getValueProps?: (value: any) => Record<string, any>;
  normalize?: (value: any, prevValue: any) => any;

  rules?: Rule[];
};
const FormItem = <TFieldValues extends FieldValues = FieldValues>({
  control: _control, // definded for name
  name,
  label,
  description,
  children,
  required: defaultRequired,

  className,
  layout,
  colon,
  labelCol,
  labelAlign,
  labelWrap,
  wrapperCol,

  valuePropName,
  getValueProps,
  normalize,
}: FormItemProps<TFieldValues>) => {
  const formContext = useFormContext();

  const id = formContext?.id;
  const form = formContext?.form;
  const required = useRequiredFieldCheck(name, defaultRequired);

  const mergedLayout = layout ?? formContext?.layout;
  const mergedLabelCol = labelCol ?? formContext?.labelCol;
  const mergedLabelAlign = labelAlign ?? formContext?.labelAlign;
  const mergedLabelWrap = labelWrap ?? formContext?.labelWrap;
  const mergedWrapperCol = wrapperCol ?? formContext?.wrapperCol;
  const mergedColon = colon ?? formContext?.colon;

  if (!name || !form) {
    return (
      <FormItemRow
        id={id}
        name={name}
        label={label}
        description={description}
        required={required}
        className={className}
        layout={mergedLayout}
        colon={mergedColon}
        labelCol={mergedLabelCol}
        labelAlign={mergedLabelAlign}
        labelWrap={mergedLabelWrap}
        wrapperCol={mergedWrapperCol}
        invalid={false}
        errors={[]}
      >
        {children &&
          React.cloneElement(children, {
            id: `${id}-${name}`,
            name,
            "aria-invalid": false,
          })}
      </FormItemRow>
    );
  }

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const finalValuePropName = valuePropName ?? "value";
        return (
          <FormItemRow
            id={id}
            name={name}
            label={label}
            description={description}
            required={required}
            className={className}
            layout={mergedLayout}
            colon={mergedColon}
            labelCol={mergedLabelCol}
            labelAlign={mergedLabelAlign}
            labelWrap={mergedLabelWrap}
            wrapperCol={mergedWrapperCol}
            invalid={fieldState.invalid}
            errors={[fieldState.error]}
          >
            {children &&
              React.cloneElement(children, {
                ...field,
                id: `${id}-${name}`,
                name,
                "aria-invalid": fieldState.invalid,
                [finalValuePropName]: field.value,
                // Apply getValueProps if provided
                ...(getValueProps ? getValueProps(field.value) : {}),
                onBlur: (event: any) => {
                  children.props.onBlur?.(event);
                  field.onBlur();
                },
                onChange: (event: any) => {
                  children.props.onChange?.(event);

                  const value = event === undefined ? null : event; // fix react-hook-form doesn't support undefined value

                  const normalizedValue = normalize?.(value, field.value);

                  field.onChange(
                    normalize
                      ? normalizedValue === undefined
                        ? null
                        : normalizedValue
                      : value,
                  );
                },
              })}
          </FormItemRow>
        );
      }}
    />
  );
};

export { FormItem };

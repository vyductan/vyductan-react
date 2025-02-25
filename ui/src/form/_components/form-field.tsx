"use client";

import type {
  Control,
  ControllerFieldState,
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormStateReturn,
} from "react-hook-form";
import React from "react";
import { Controller, useWatch } from "react-hook-form";

import { FormFieldContext, useFormContext } from "../context";
import { useFieldOptionalityCheck } from "../hooks/use-field-optionality-check";
import { FieldRender } from "./form-field-render";
import { FormItem } from "./form-item";

type FieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, "render" | "name"> & {
  ref?: React.ForwardedRef<HTMLDivElement>;
  name?: TName;
  label?: string | React.JSX.Element;
  description?: React.ReactNode;
  className?: string;
  layout?: "horizontal" | "vertical";
  required?: boolean;
  /*
   * Custome output for input component (like DatePicker, Upload)
   * */
  onChange?: (...event: any[]) => any;
  children?:
    | React.ReactElement<any>
    | (({
        field,
        fieldState,
        formState,
      }: {
        field: FieldControllerRenderProps<TFieldValues, TName>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<TFieldValues>;
      }) => React.ReactElement<any>);

  render?: ({
    field,
    fieldState,
    formState,
  }: {
    field: FieldControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement<any>;
};
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ref,
  //control,
  name,
  children,
  render,
  required,
  onChange,

  layout,

  ...props
}: FieldProps<TFieldValues, TName>) => {
  const form = useFormContext<TFieldValues>();

  const isOptional = useFieldOptionalityCheck(name, form?.schema);
  const isRequired =
    required ?? (isOptional === undefined ? false : !isOptional);

  if (render && name) {
    return (
      <FormFieldContext.Provider value={{ name: name }}>
        <Controller name={name} render={render} {...props} />
      </FormFieldContext.Provider>
    );
  }
  if (form && name) {
    return (
      <FieldController
        control={form.control}
        name={name}
        children={children}
        onChange={onChange}
        required={isRequired}
        layout={layout}
        {...props}
      />
    );
  }
  if (name && typeof children !== "function") {
    return (
      <FormFieldContext.Provider
        value={{
          name,
        }}
      >
        <FormItem>
          <FieldRender
            children={children}
            ref={ref}
            required={required}
            layout={layout}
            {...props}
          />
        </FormItem>
      </FormFieldContext.Provider>
    );
  }

  if (typeof children !== "function") {
    return (
      <FieldRender
        children={children}
        required={required}
        layout={layout}
        {...props}
      />
    );
  }
  return;
};

type FieldControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  ref?: React.ForwardedRef<HTMLDivElement>;
  control: Control<TFieldValues>;
  name: TName;
  children?:
    | React.ReactElement<any>
    | (({
        field,
        fieldState,
        formState,
      }: {
        field: FieldControllerRenderProps<TFieldValues, TName>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<TFieldValues>;
      }) => React.ReactElement<any>);
  onChange?: (...event: any[]) => any;

  disabled?: boolean;
  required?: boolean;

  layout?: "horizontal" | "vertical";

  className?: string;
};
const FieldController = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ref,
  control,
  name,
  onChange,
  children,
  disabled,
  required,
  layout,

  className,
  ...props
}: FieldControllerProps<TFieldValues, TName>) => {
  const watchedValue = useWatch({
    control,
    name,
  });

  return (
    <FormFieldContext.Provider
      value={{
        name,
      }}
    >
      <Controller
        control={control}
        name={name}
        disabled={disabled}
        render={({ field, fieldState, formState }) => {
          return (
            <FormItem className={className}>
              <FieldRender
                fieldState={fieldState}
                required={required}
                children={
                  children
                    ? typeof children === "function"
                      ? children({
                          field,
                          fieldState,
                          formState,
                        })
                      : React.cloneElement(
                          children as React.ReactElement<{
                            value?: any;
                            onBlur?: (...event: any[]) => any;
                            onChange?: (...event: any[]) => any;
                          }>,
                          {
                            ...field,
                            value: watchedValue ?? "",
                            onBlur: (event: any) => {
                              (
                                children.props as {
                                  onBlur?: (...event: any[]) => any;
                                }
                              ).onBlur?.(event);
                              // field.onBlur(onChange ? onChange(event) : event);
                              field.onBlur();
                            },
                            onChange: (event: any) => {
                              (
                                children.props as {
                                  onChange?: (...event: any[]) => any;
                                }
                              ).onChange?.(event);
                              field.onChange(
                                onChange ? onChange(event) : event,
                              );
                            },
                          },
                        )
                    : undefined
                }
                ref={ref}
                layout={layout}
                {...props}
              />
            </FormItem>
          );
        }}
      />
    </FormFieldContext.Provider>
  );
};

type FieldControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerRenderProps<TFieldValues, TName>;

export { FormField, FormField as Field };
export type { FieldProps };

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

import { FieldRender } from "./_components/field-render";
import { FormItem } from "./_components/form-item";
import { FormFieldContext, useFormContext } from "./context";
import { useFieldOptionalityCheck } from "./use-field-optionality-check";

type FieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, "render" | "name"> & {
  name?: TName;
  label?: string | React.JSX.Element;
  description?: React.ReactNode;
  className?: string;
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
const FieldInner = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  {
    //control,
    name,
    children,
    render,
    required,
    onChange,
    ...props
  }: FieldProps<TFieldValues, TName>,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
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
            {...props}
          />
        </FormItem>
      </FormFieldContext.Provider>
    );
  }

  if (typeof children !== "function") {
    return <FieldRender children={children} required={required} {...props} />;
  }
  return;
};

type FieldControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
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
};
const InternalFieldController = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  {
    control,
    name,
    onChange,
    children,
    disabled,
    required,
    ...props
  }: FieldControllerProps<TFieldValues, TName>,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
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
            <FormItem>
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
                {...props}
              />
            </FormItem>
          );
        }}
      />
    </FormFieldContext.Provider>
  );
};
const FieldController = React.forwardRef(InternalFieldController) as <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldControllerProps<TFieldValues, TName>,
) => ReturnType<typeof InternalFieldController>;

type FieldControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerRenderProps<TFieldValues, TName>;

const Field = React.forwardRef(FieldInner) as <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldProps<TFieldValues, TName>,
) => ReturnType<typeof FieldInner>;

export { Field, Field as FormField };
export type { FieldProps };

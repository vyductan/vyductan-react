"use client";

import type { ForwardedRef, ReactElement, ReactNode } from "react";
import type {
  Control,
  ControllerFieldState,
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormStateReturn,
} from "react-hook-form";
import { cloneElement, forwardRef, useId } from "react";
import { Controller, useWatch } from "react-hook-form";

import { FieldRender } from "./_components/field-render";
import { FormFieldContext, useFormContext } from "./context";
import { useFieldOptionalityCheck } from "./use-field-optionality-check";

type FieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, "render" | "name"> & {
  // Required<Pick<ControllerProps<TFieldValues, TName>, "control">> & {
  name?: TName;
  label?: string | JSX.Element;
  description?: ReactNode;
  className?: string;
  required?: boolean;
  /*
   * Custome output for input component (like DatePicker, Upload)
   * */
  onChange?: (...event: any[]) => any;
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

  render?: ({
    field,
    fieldState,
    formState,
  }: {
    field: FieldControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
};
const FieldInner = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  {
    // control,
    name,
    children,
    required,
    // label,
    // description,
    // children,
    // className,
    onChange,
    ...props
  }: FieldProps<TFieldValues, TName>,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const id = useId();
  const fieldId = `${id}-form-item`;
  const fieldDescriptionId = `${id}-form-item-description`;
  const fieldMessageId = `${id}-form-item-message`;

  // const form =
  //   useFormContext<TFieldValues>() as UseFormReturn<TFieldValues> | null;
  const form = useFormContext<TFieldValues>();

  // console.log(form.control._options.resolver({[field.name]: field.value}, context, {}))
  //

  const isOptional = useFieldOptionalityCheck(name, form?.schema);

  if (form && name) {
    return (
      <FieldController
        id={id}
        fieldId={fieldId}
        fieldMessageId={fieldMessageId}
        fieldDescriptionId={fieldDescriptionId}
        control={form.control}
        name={name}
        children={children}
        onChange={onChange}
        required={required ?? (isOptional === undefined ? false : !isOptional)}
        {...props}
      />
    );
  }
  if (name && typeof children !== "function") {
    return (
      <FormFieldContext.Provider
        value={{
          name,
          // id,
          // fieldId,
          // fieldDescriptionId,
          // fieldMessageId,
        }}
      >
        <FieldRender
          fieldId={fieldId}
          fieldMessageId={fieldMessageId}
          fieldDescriptionId={fieldDescriptionId}
          children={children}
          ref={ref}
          required={required}
          {...props}
        />
      </FormFieldContext.Provider>
    );
  }

  if (typeof children !== "function") {
    return (
      <FieldRender
        fieldId={fieldId}
        children={children}
        required={required}
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
  control: Control<TFieldValues>;
  name: TName;
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
  onChange?: (...event: any[]) => any;

  id: string;
  fieldId: string;
  fieldMessageId: string;
  fieldDescriptionId: string;
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
    // id,
    fieldId,
    fieldMessageId,
    fieldDescriptionId,
    disabled,
    required,
    ...props
  }: FieldControllerProps<TFieldValues, TName>,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const watchedValue = useWatch({
    control,
    name,
  });
  return (
    <FormFieldContext.Provider
      value={{
        name,
        // id,
        // fieldId,
        // fieldDescriptionId,
        // fieldMessageId,
      }}
    >
      <Controller
        control={control}
        name={name}
        disabled={disabled}
        render={({ field, fieldState, formState }) => (
          <FieldRender
            fieldId={fieldId}
            fieldMessageId={fieldMessageId}
            fieldDescriptionId={fieldDescriptionId}
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
                  : cloneElement(children, {
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
                        field.onChange(onChange ? onChange(event) : event);
                      },
                    })
                : undefined
            }
            ref={ref}
            {...props}
          />
        )}
      />
    </FormFieldContext.Provider>
  );
};
const FieldController = forwardRef(InternalFieldController) as <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldControllerProps<TFieldValues, TName>,
) => ReturnType<typeof InternalFieldController>;

type FieldControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerRenderProps<TFieldValues, TName>;

const Field = forwardRef(FieldInner) as <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldProps<TFieldValues, TName>,
) => ReturnType<typeof FieldInner>;

export { Field, Field as FormField };
export type { FieldProps };

"use client";

import type { VariantProps } from "class-variance-authority";
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

import type { inputVariants } from "../input";
import { clsm } from "..";
import { GenericSlot } from "../slot";
import { FormFieldContext, useFormContext } from "./context";
import { FieldDescription } from "./field-description";
import { FieldLabel } from "./field-label";
import { FieldMessage } from "./field-message";
import { useFieldOptionalityCheck } from "./use-field-optionality-check";

type FieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, "render" | "name"> & {
  // Required<Pick<ControllerProps<TFieldValues, TName>, "control">> & {
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
  name?: TName;
  label?: string | JSX.Element;
  description?: ReactNode;
  className?: string;
  required?: boolean;
  /*
   * Custome output for input component (like DatePicker, Upload)
   * */
  onChange?: (...event: any[]) => any;
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
          id,
          fieldId,
          fieldDescriptionId,
          fieldMessageId,
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
    id,
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
        id,
        fieldId,
        fieldDescriptionId,
        fieldMessageId,
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

type FieldRenderProps = {
  className?: string;

  label?: string | JSX.Element;
  description?: ReactNode;
  children?: ReactElement | null;

  fieldId?: string;
  fieldDescriptionId?: string;
  fieldMessageId?: string;

  fieldState?: ControllerFieldState;

  required?: boolean;
};
const FieldRender = forwardRef<HTMLDivElement, FieldRenderProps>(
  (
    {
      className,
      label,
      description,
      children,

      fieldId,
      fieldDescriptionId,
      fieldMessageId,

      fieldState,

      required,

      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={clsm(
          "flex flex-col",
          fieldState?.error ? "" : "mb-6",
          className,
        )}
        ref={ref}
        {...props}
      >
        {!fieldId && children ? (
          children
        ) : (
          <>
            {/* Label */}
            {label ? (
              typeof label === "string" ? (
                <FieldLabel className="pb-2" required={required}>
                  {label}
                </FieldLabel>
              ) : (
                label
              )
            ) : undefined}

            {/* Input */}
            <GenericSlot<VariantProps<typeof inputVariants>>
              id={fieldId}
              aria-describedby={
                fieldState?.error
                  ? `${fieldDescriptionId} ${fieldMessageId}`
                  : `${fieldDescriptionId}`
              }
              aria-invalid={!!fieldState?.error}
              status={fieldState?.error ? "error" : "default"}
            >
              {children}
              {/* {children */}
              {/*   ? typeof children === "function" */}
              {/*     ? children() */}
              {/*     : cloneElement(children) */}
              {/*   : null} */}
              {/* {children */}
              {/*   ? typeof children === "function" */}
              {/*     ? children({ */}
              {/*         field, */}
              {/*         fieldState, */}
              {/*         formState, */}
              {/*       }) */}
              {/*     : cloneElement(children, field) */}
              {/*   : null} */}
            </GenericSlot>
            {/* Description */}
            {description && <FieldDescription>{description}</FieldDescription>}
            {/* Message */}
            <FieldMessage />
          </>
        )}
      </div>
    );
  },
);

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

export { Field };
export type { FieldProps };

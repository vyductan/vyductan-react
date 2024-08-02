"use client";

import type { VariantProps } from "class-variance-authority";
import type { ForwardedRef, ReactElement, ReactNode } from "react";
import type {
  ControllerFieldState,
  ControllerProps,
  ControllerRenderProps,
  FieldError,
  FieldPath,
  FieldValues,
  UseFormReturn,
  UseFormStateReturn,
} from "react-hook-form";
import { cloneElement, forwardRef, useId } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, useFormContext } from "react-hook-form";

import type { inputVariants } from "../input";
import { clsm } from "..";
import { GenericSlot } from "../slot";
import { FormFieldContext } from "./context";
import { FieldDescription } from "./FieldDescription";
import { FieldLabel } from "./FieldLabel";
import { FieldMessage } from "./FieldMessage";
import { useField } from "./useField";

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
  /*
   * Custome output for input component (like DatePicker)
   * */
  onChange?: (...event: any[]) => any;
};
const FieldInner = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  {
    control,
    name,
    children,
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

  const form =
    useFormContext<TFieldValues>() as UseFormReturn<TFieldValues> | null;

  if (form && name) {
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
          // defaultValue=""
          // render={(x) => {
          //   console.log("rrrrrrr", x.fieldState.error);
          //   return <>rrrr{x.fieldState.error?.message}</>;
          // }}
          //{...props}
          render={({ field, fieldState, formState }) => (
            <FieldRender
              fieldId={fieldId}
              fieldMessageId={fieldMessageId}
              fieldDescriptionId={fieldDescriptionId}
              fieldState={fieldState}
              // formState={formState}
              // error={fieldState.errors[name]}
              // error={formState.errors[name]}
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
                        value:
                          field.value !== undefined || field.value !== null
                            ? field.value
                            : "",
                        onChange: (e: any) => {
                          children.props.onChange?.(e);
                          field.onChange(onChange ? onChange(e) : e);
                        },
                      })
                  : null
              }
              ref={ref}
              {...props}
            />
          )}
        />
      </FormFieldContext.Provider>
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
          {...props}
        />
      </FormFieldContext.Provider>
    );
  }

  if (typeof children !== "function") {
    return <FieldRender children={children} />;
  }
  return null;
};

type FieldRenderProps = {
  className?: string;

  label?: string | JSX.Element;
  description?: ReactNode;
  // error?: string FieldError;
  // error?: FieldError;
  children?: ReactElement | null;

  fieldId?: string;
  fieldDescriptionId?: string;
  fieldMessageId?: string;

  fieldState?: ControllerFieldState;
  // formState?: UseFormStateReturn<any>;
};
const FieldRender = forwardRef<HTMLDivElement, FieldRenderProps>(
  (
    {
      className,
      label,
      description,
      // error,
      children,

      fieldId,
      fieldDescriptionId,
      fieldMessageId,

      fieldState,
      // formState,

      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={clsm(
          "flex flex-col",
          !fieldState?.error ? "mb-6" : "",
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
                <FieldLabel className="pb-2">{label}</FieldLabel>
              ) : (
                label
              )
            ) : null}

            {/* Input */}
            <GenericSlot<VariantProps<typeof inputVariants>>
              id={fieldId}
              aria-describedby={
                !fieldState?.error
                  ? `${fieldDescriptionId}`
                  : `${fieldDescriptionId} ${fieldMessageId}`
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

"use client";

import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import React, { cloneElement, isValidElement } from "react";

import { cn } from "@acme/ui/lib/utils";
import { FormField as ShadFormField } from "@acme/ui/shadcn/form";

import { useFormContext } from "../context";
import { useFieldOptionalityCheck } from "../hooks/use-field-optionality-check";
import { FormControl } from "./form-control";
import { FormItem } from "./form-item";
import { FieldLabel } from "./form-label";
import { FieldMessage } from "./form-message";

// type FormFieldContextValue<
//   TFieldValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
// > = {
//   name: TName;
// };
// const FormFieldContext = React.createContext<FormFieldContextValue>(
//   {} as FormFieldContextValue,
// );

type FieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = Omit<
  ControllerProps<TFieldValues, TName, TTransformedValues>,
  "render" | "name"
> & {
  ref?: React.ForwardedRef<HTMLDivElement>;
  name?: ControllerProps<TFieldValues, TName, TTransformedValues>["name"];
  label?: string | React.JSX.Element;
  description?: React.ReactNode;
  className?: string;
  layout?: "horizontal" | "vertical";
  required?: boolean;

  /*
  /* Normalize value from component value before passing to Form instance. Do not support async
  /* */
  normalize?: (value: any, prevValue: any) => any;

  children?: React.ReactElement;

  render?: ControllerProps<TFieldValues, TName, TTransformedValues>["render"];
};
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,

  children,
  render,

  label: labelProp,

  className,

  required: requiredProp,

  layout: layoutProp,

  normalize,

  ...props
}: FieldProps<TFieldValues, TName, TTransformedValues>) => {
  const form = useFormContext<TFieldValues, any, TFieldValues>();
  const layout = layoutProp ?? form?.layout;
  const classNames = form?.classNames;

  const optional = useFieldOptionalityCheck(name, form?.schema);
  const required = requiredProp ?? (optional === undefined ? false : !optional);

  // if (render && name) {
  //   return (
  //     <FormFieldContext.Provider value={{ name: name }}>
  //       <Controller name={name} render={render} {...props} />
  //     </FormFieldContext.Provider>
  //   );
  // }
  // if (form && name) {
  //   return (
  //     <FieldController
  //       control={form.control}
  //       name={name}
  //       children={children}
  //       onChange={onChange}
  //       required={isRequired}
  //       layout={layout}
  //       classNames={classNames}
  //       {...props}
  //     />
  //   );
  // }

  // Based on shadcn
  if (render && control && name) {
    return <ShadFormField control={control} name={name} render={render} />;
  }

  const label = labelProp && (
    <FieldLabel className={cn(classNames?.label)} required={required}>
      {labelProp}
    </FieldLabel>
  );
  if (
    !render &&
    form &&
    name &&
    isValidElement<{
      onBlur?: (event: any) => void;
      onChange?: (event: any) => void;
    }>(children)
  ) {
    return (
      <ShadFormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem layout={layout} className={className} {...props}>
            {label}
            <div className="w-full">
              <FormControl>
                {cloneElement(children, {
                  ...field,
                  // value: watchedValue,
                  onBlur: (event) => {
                    children.props.onBlur?.(event);
                    field.onBlur();
                  },
                  onChange: (event: any) => {
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
              </FormControl>
              <FieldMessage />
            </div>
          </FormItem>
        )}
      />
    );
  }
  // if (nadme) {
  //   return (
  //     <FormFieldContext.Provider
  //       value={{
  //         name,
  //       }}
  //     >
  //       <FormItem {...props}>
  //         {ContentComp}
  //         {/* <FieldRender
  //           children={children}
  //           ref={ref}
  //           required={required}
  //           layout={layout}
  //           classNames={classNames}
  //           {...props}
  //         /> */}
  //       </FormItem>
  //     </FormFieldContext.Provider>
  //   );
  // }

  // No control and name
  return (
    <FormItem
      layout={layout}
      className={cn(!label && "grid-cols-1", className)}
      {...props}
    >
      {label}
      {children}
    </FormItem>
  );
};

// type FieldControllerProps<
//   TFieldValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
// > = {
//   ref?: React.ForwardedRef<HTMLDivElement>;
//   control: Control<TFieldValues>;
//   name: TName;
//   children?:
//     | React.ReactElement<any>
//     | (({
//         field,
//         fieldState,
//         formState,
//       }: {
//         field: FieldControllerRenderProps<TFieldValues, TName>;
//         fieldState: ControllerFieldState;
//         formState: UseFormStateReturn<TFieldValues>;
//       }) => React.ReactElement<any>);
//   onChange?: (...event: any[]) => any;

//   disabled?: boolean;
//   required?: boolean;

//   layout?: "horizontal" | "vertical";
//   classNames?: {
//     label?: string;
//   };

//   className?: string;
// };
// const FieldController = <
//   TFieldValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
// >({
//   ref,
//   control,
//   name,
//   onChange,
//   children,
//   disabled,
//   required,
//   layout,

//   className,
//   classNames,
//   ...props
// }: FieldControllerProps<TFieldValues, TName>) => {
//   const watchedValue = useWatch({
//     control,
//     name,
//   });

//   return (
//     <FormFieldContext.Provider
//       value={{
//         name,
//       }}
//     >
//       <Controller
//         control={control}
//         name={name}
//         disabled={disabled}
//         render={({ field, fieldState, formState }) => {
//           return (
//             <FormItem className={className} layout={layout}>
//               <FieldRender
//                 required={required}
//                 children={
//                   children
//                     ? typeof children === "function"
//                       ? children({
//                           field,
//                           fieldState,
//                           formState,
//                         })
//                       : React.cloneElement(
//                           children as React.ReactElement<{
//                             value?: any;
//                             onBlur?: (...event: any[]) => any;
//                             onChange?: (...event: any[]) => any;
//                           }>,
//                           {
//                             ...field,
//                             value: watchedValue,
//                             onBlur: (event: any) => {
//                               (
//                                 children.props as {
//                                   onBlur?: (...event: any[]) => any;
//                                 }
//                               ).onBlur?.(event);
//                               // field.onBlur(onChange ? onChange(event) : event);
//                               field.onBlur();
//                             },
//                             onChange: (event: any) => {
//                               (
//                                 children.props as {
//                                   onChange?: (...event: any[]) => any;
//                                 }
//                               ).onChange?.(event);
//                               field.onChange(
//                                 onChange ? onChange(event) : event,
//                               );
//                             },
//                           },
//                         )
//                     : undefined
//                 }
//                 ref={ref}
//                 classNames={classNames}
//                 {...props}
//               />
//             </FormItem>
//           );
//         }}
//       />
//     </FormFieldContext.Provider>
//   );
// };

// type FieldControllerRenderProps<
//   TFieldValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
// > = ControllerRenderProps<TFieldValues, TName>;

export { FormField, FormField as Field };
export type { FieldProps };

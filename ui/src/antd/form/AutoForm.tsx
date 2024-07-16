"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import React from "react";
import { Select } from "antd";

import { clsm } from "@acme/ui";

import type { FormProps } from "./Form";
import type { FieldsSchema, FieldType, InputUnion } from "./types";
import type { FormInstance } from "./useForm";
import { DeleteIcon } from "../../icons";
import { Button } from "../button";
import { DatePicker, DateRangePicker } from "../date-picker";
import { Input, InputPassword } from "../input";
import { RadioGroup } from "../radio";
import { Tag } from "../tag";
import { Textarea } from "../textarea";
import { Form } from "./Form";
import { FormItem } from "./FormItem";
import { FormList } from "./FormList";

/*
 * Docs: https://procomponents.ant.design/en-US/components/schema-form
 */
type AutoFormProps<
  TFieldValues extends FieldValues,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
  TFieldType extends FieldType = FieldType,
> = Omit<FormProps<TFieldValues, TContext, TTransformedValues>, "children"> & {
  form: FormInstance<TFieldValues, TContext, TTransformedValues>;
  fields: FieldsSchema<TFieldValues, TFieldType>[];
};
const AutoForm = <
  TFieldValues extends FieldValues = FieldValues,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
  TFieldType extends FieldType = FieldType,
>({
  form,
  fields,
  ...restProps
}: AutoFormProps<TFieldValues, TContext, TTransformedValues, TFieldType>) => {
  const { control } = form;

  const render = <TFieldValues extends FieldValues = FieldValues>(
    fields: Array<FieldsSchema<TFieldValues>>,
  ) =>
    fields.map((field, index) => {
      const component = (() => {
        if (field.type === "custom") {
          return <>{field.render()}</>;
        }
        if (field.type === "group") {
          const { columns, className } = field;
          return (
            <div
              className={clsm(
                "relative",
                "grid gap-x-4",
                "auto-cols-fr grid-flow-col",
                className,
              )}
            >
              {render(columns)}
            </div>
          );
        }

        if (field.type === "list") {
          const {
            type: _,
            name,
            label,
            itemTitle,
            appendProps,
            fields: schemaFields,
            // ...rest
          } = field;
          return (
            <FormList name={name} label={label}>
              {(fields, oparation, _meta) => {
                return (
                  <>
                    {fields.map(({ key, name }) => {
                      return (
                        <FormItem key={key}>
                          <>
                            <div className="mb-2 flex justify-between">
                              <Tag className="rounded-md">
                                {itemTitle ?? "Item"} #{index}
                              </Tag>
                              <Button
                                icon={
                                  <DeleteIcon
                                    className="cursor-pointer"
                                    onClick={() => oparation.remove(index)}
                                  />
                                }
                              />
                            </div>
                            {render(
                              schemaFields.map(
                                (field) =>
                                  ({
                                    ...field,
                                    ...(field.type === "group"
                                      ? {}
                                      : field.name
                                        ? {
                                            name: `${name}.${index}.${String(field.name)}`,
                                          }
                                        : { name: `${name}.${index}` }),
                                  }) as unknown as FieldsSchema<
                                    TFieldValues[keyof TFieldValues]
                                  >,
                              ),
                            )}
                          </>
                        </FormItem>
                      );
                    })}
                    <Button
                      variant="dashed"
                      type="button"
                      className="w-full"
                      onClick={() => oparation.add(appendProps?.defaultValue)}
                    >
                      {appendProps?.title ?? "Add new Item"}
                    </Button>
                  </>
                );
              }}
            </FormList>
          );
          // return (
          //   <FormList name={name} {...rest}>
          //     {({ fields, append, remove }) => (
          //       <div>
          //         {fields.map((item, index) => (
          //           <div key={item.id}>
          //             <div className="mb-2 flex justify-between">
          //               <Tag className="rounded-md">
          //                 {itemTitle ?? "Item"} #{index}
          //               </Tag>
          //               <DeleteIcon
          //                 className="cursor-pointer"
          //                 onClick={() => remove(index)}
          //               />
          //             </div>
          //             {render(
          //               schemaFields.map(
          //                 (field) =>
          //                   ({
          //                     ...field,
          //                     ...(field.type === "group"
          //                       ? {}
          //                       : field.name
          //                         ? {
          //                             name: `${name}.${index}.${String(field.name)}`,
          //                           }
          //                         : { name: `${name}.${index}` }),
          //                   }) as unknown as FieldsSchema<
          //                     TFieldValues[keyof TFieldValues]
          //                   >,
          //               ),
          //             )}
          //           </div>
          //         ))}
          //         <Button
          //           variant="dashed"
          //           type="button"
          //           className="w-full"
          //           onClick={() => append(appendProps?.defaultValue)}
          //         >
          //           {appendProps?.title ?? "Add new Item"}
          //         </Button>
          //       </div>
          //     )}
          //   </FormList>
          // );
        }
        const { name, label, className, ...rest } = field;

        return (
          <FormItem
            name={name as Path<TFieldValues>}
            control={control as unknown as Control<TFieldValues>}
            label={label}
            // description={description}
            className={className}
            // defaultValue={
            //   ["text", "select"].includes(field.type)
            //     ? ("" as PathValue<TFieldValues, Path<TFieldValues>>)
            //     : undefined
            // }
          >
            {renderInput({
              type: field.type,
              ...rest,
            })}
          </FormItem>
        );
        // return (
        //   <FormItem
        //     name={name as Path<TFieldValues>}
        //     control={control as unknown as Control<TFieldValues>}
        //     label={label}
        //     // description={description}
        //     className={className}
        //     // defaultValue={
        //     //   ["text", "select"].includes(field.type)
        //     //     ? ("" as PathValue<TFieldValues, Path<TFieldValues>>)
        //     //     : undefined
        //     // }
        //   >
        //     {({ field: fieldRenderProps }) => {
        //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //       const onChange = (...event: any) => {
        //         if ("onChange" in rest && typeof rest.onChange === "function") {
        //           // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        //           rest.onChange(...event);
        //         }
        //         // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        //         fieldRenderProps.onChange(...event);
        //       };
        //       return renderInput({
        //         ...rest,
        //         ...fieldRenderProps,
        //         onChange,
        //       } as InputUnion);
        //     }}
        //   </FormItem>
        // );
      })();
      return <React.Fragment key={index}>{component}</React.Fragment>;
    });
  return (
    <Form form={form} {...restProps}>
      {render(fields)}
    </Form>
  );
};

const renderInput = (props: InputUnion) => {
  if (props.type === "date") {
    const { type: _, ...restProps } = props;
    return <DatePicker {...restProps} />;
  }
  if (props.type === "date-range") {
    return <DateRangePicker {...props} />;
  }
  // if (props.type === "editor") {
  //   const { onChange, ...rest } = props;
  //   return (
  //     <Editor
  //       onChange={(editorState) => {
  //         onChange?.(JSON.stringify(editorState));
  //       }}
  //       {...rest}
  //     />
  //   );
  // }
  if (props.type === "password") {
    const { type: _, ...rest } = props;
    return <InputPassword {...rest} />;
  }
  if (props.type === "radio-group") {
    return <RadioGroup {...props} />;
  }
  if (props.type === "select") {
    const { type: _, ...restProps } = props;
    return <Select {...restProps} />;
  }
  if (props.type === "text") {
    return <Input {...props} />;
  }
  if (props.type === "textarea") {
    return <Textarea {...props} />;
  }
  return <></>;
};

export { AutoForm };

"use client";

import type { FieldValues, UseFormRegister } from "react-hook-form";

import { DeleteOutlined } from "@vyductan/icons";

import type { FormProps } from "./Form";
import type { FieldsSchema, FieldType } from "./types";
import { Button } from "../button";
import { Input } from "../input";
import { RadioGroup } from "../radio";
import { Tag } from "../tag";
import { Field } from "./Field";
import { FieldArray } from "./FieldArray";
import { Form } from "./Form";
import { fieldInputTypes } from "./types";

/*
 * Docs: https://procomponents.ant.design/en-US/components/schema-form
 */
type AutoFormProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues | undefined = undefined,
  TFieldType extends FieldType = FieldType,
> = Omit<FormProps<TFieldValues, TContext, TTransformedValues>, "children"> & {
  fields: FieldsSchema<TFieldValues, TFieldType>[];
};
const AutoForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
  TFieldType extends FieldType = FieldType,
>({
  fields,
  ...rest
}: AutoFormProps<TFieldValues, TContext, TTransformedValues, TFieldType>) => {
  return (
    <Form {...rest}>
      {(form) => {
        return (
          <>
            {fields.map((field, index) => (
              <AutoFormField
                field={field}
                register={form.register}
                key={index}
              />
            ))}
          </>
        );
      }}
    </Form>
  );
};

const AutoFormField = <TFieldValues extends FieldValues = FieldValues>({
  field,
  register,
}: {
  field: FieldsSchema<TFieldValues>;
  register: UseFormRegister<any>;
}) => {
  if (field.type === "list") {
    const {
      type: _,
      name,
      itemTitle,
      appendProps,
      fields: schemaFields,
      ...rest
    } = field;
    return (
      <FieldArray name={name} {...rest}>
        {({ fields, append, remove }) => (
          <div>
            {fields.map((item, index) => (
              <div key={item.id}>
                <div className="mb-2 flex justify-between">
                  <Tag className="rounded-md">
                    {itemTitle ?? "Item"} #{index}
                  </Tag>
                  <DeleteOutlined
                    className="cursor-pointer"
                    onClick={() => remove(index)}
                  />
                </div>
                {schemaFields.map((field) => {
                  const key = field.name ? `${item.id}.${field.name}` : item.id;
                  const itemName = field.name
                    ? `${name}.${index}.${field.name}`
                    : `${name}.${index}`;
                  return (
                    <AutoFormField<TFieldValues[keyof TFieldValues]>
                      key={key}
                      field={{
                        ...field,
                        name: itemName,
                      }}
                      register={register}
                    />
                  );
                })}
              </div>
            ))}
            <Button
              type="dashed"
              htmlType="button"
              className="w-full"
              onClick={() => append(appendProps?.defaultValue)}
            >
              {appendProps?.title || "Add new Item"}
            </Button>
          </div>
        )}
      </FieldArray>
    );
  }
  if (fieldInputTypes.includes(field.type)) {
    const { name, label, description, className, ...rest } = field;

    return (
      <Field
        name={name}
        label={label}
        description={description}
        className={className}
      >
        {({ field: fieldRenderProps }) => {
          return renderFieldInput({
            props: {
              ...rest,
              ...fieldRenderProps,
            } as FieldsSchema<TFieldValues>,
          });
        }}
      </Field>
    );
  }
};

const renderFieldInput = <TFieldValues extends FieldValues = FieldValues>({
  props,
}: {
  props: FieldsSchema<TFieldValues>;
}) => {
  if (props.type === "radio-group") {
    return <RadioGroup {...props} />;
  }
  if (props.type === "text") {
    return <Input {...props} />;
  }
  return <></>;
};

export { AutoForm };

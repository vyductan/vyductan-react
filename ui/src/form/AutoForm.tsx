"use client";

import type {
  Control,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

import { DeleteOutlined } from "@vyductan/icons";

import type { FieldsSchema, FieldType, InputUnion } from "./types";
import type { FormInstance } from "./useForm";
import { Button } from "../button";
import { DatePicker } from "../date-picker";
import Editor from "../editor";
import { Input } from "../input";
import { RadioGroup } from "../radio";
import { Tag } from "../tag";
import { Field } from "./Field";
import { FieldArray } from "./FieldArray";
import { Form } from "./Form";

/*
 * Docs: https://procomponents.ant.design/en-US/components/schema-form
 */
type AutoFormProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues | undefined = undefined,
  TFieldType extends FieldType = FieldType,
> = {
  form: FormInstance<TFieldValues, TContext, TTransformedValues>;
  fields: FieldsSchema<TFieldValues, TFieldType>[];
};
const AutoForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
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
                control={form.control}
                key={index}
              />
            ))}
          </>
        );
      }}
    </Form>
  );
};

const AutoFormField = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>({
  field,
  control,
  register,
}: {
  field: FieldsSchema<TFieldValues>;
  control: Control<TFieldValues, TContext>;
  register: UseFormRegister<TFieldValues>;
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
                  if (!field.type) return;

                  const key = field.name ? `${item.id}.${field.name}` : item.id;
                  const itemName = field.name
                    ? `${name}.${index}.${field.name}`
                    : `${name}.${index}`;
                  return (
                    <AutoFormField
                      key={key}
                      field={
                        {
                          ...field,
                          name: itemName,
                        } as unknown as FieldsSchema<
                          TFieldValues[keyof TFieldValues]
                        >
                      }
                      control={
                        control as unknown as Control<
                          TFieldValues[keyof TFieldValues],
                          TContext
                        >
                      }
                      register={
                        register as unknown as UseFormRegister<
                          TFieldValues[keyof TFieldValues]
                        >
                      }
                    />
                  );
                })}
              </div>
            ))}
            <Button
              variant="dashed"
              type="button"
              className="w-full"
              onClick={() => append(appendProps?.defaultValue)}
            >
              {appendProps?.title ?? "Add new Item"}
            </Button>
          </div>
        )}
      </FieldArray>
    );
  }
  const { name, label, description, className, ...rest } = field;

  return (
    <Field
      name={name as Path<TFieldValues>}
      label={label}
      description={description}
      className={className}
      control={control}
    >
      {({ field: fieldRenderProps }) => {
        return renderInput({
          ...rest,
          ...fieldRenderProps,
        } as InputUnion);
      }}
    </Field>
  );
};

const renderInput = (props: InputUnion) => {
  if (props.type === "date") {
    return <DatePicker mode="single" {...props} />;
  }
  if (props.type === "date-range") {
    return <DatePicker mode="range" {...props} />;
  }
  if (props.type === "editor") {
    const { onChange, ...rest } = props;
    return (
      <Editor
        onChange={(editorState) => {
          onChange?.(editorState.toJSON());
        }}
        {...rest}
      />
    );
  }
  if (props.type === "radio-group") {
    return <RadioGroup {...props} />;
  }
  if (props.type === "text") {
    return <Input {...props} />;
  }
  return <></>;
};

export { AutoForm };

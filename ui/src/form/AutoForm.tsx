"use client";

import type { FieldValues } from "react-hook-form";
import React from "react";

import { DeleteOutlined } from "@vyductan/icons";
import { clsm } from "@vyductan/utils";

import type { FieldsSchema, FieldType, InputUnion } from "./types";
import type { FormInstance } from "./useForm";
import { AutoComplete } from "../autocomplete";
import { Button } from "../button";
import { DatePicker } from "../date-picker";
import Editor from "../editor";
import { Input, InputPassword } from "../input";
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
  form,
  fields,
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
                      {render(
                        schemaFields.map(
                          (field) =>
                            ({
                              ...field,
                              ...(field.type === "group"
                                ? {}
                                : field.name
                                  ? { name: `${name}.${index}.${field.name}` }
                                  : { name: `${name}.${index}` }),
                            }) as unknown as FieldsSchema<
                              TFieldValues[keyof TFieldValues]
                            >,
                        ),
                      )}
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
            name={name as any}
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
      })();
      return <React.Fragment key={index}>{component}</React.Fragment>;
    });
  return <Form form={form}>{render(fields)}</Form>;
};

const renderInput = (props: InputUnion) => {
  if (props.type === "autocomplete") {
    const { type: _, ...restProps } = props;
    return <AutoComplete {...restProps} />;
  }
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
  if (props.type === "password") {
    const { type: _, ...rest } = props;
    return <InputPassword {...rest} />;
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

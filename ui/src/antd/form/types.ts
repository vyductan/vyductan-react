import type { FieldValues } from "react-hook-form";

import type { CheckboxProps } from "../checkbox";
import type { DatePickerProps, DateRangePickerProps } from "../date-picker";
import type { InputProps } from "../input";
import type { InputPasswordProps } from "../input/Password";
import type { RadioGroupProps } from "../radio";
import type { SelectProps } from "../select";
import type { TextareaProps } from "../textarea";
import type { FormItemProps } from "./FormItem";
import type { FormListProps } from "./FormList";

export type ValueType = string | number | boolean;

type AutoFormFieldBaseProps = {
  // title?: ReactNode;

  className?: string;
  // disabled?: boolean | ((record: TFormValues) => boolean);
  // hidden?: boolean | ((record: TFormValues) => boolean);
  required?: boolean;

  // render?: (values: TFormValues) => React.ReactNode;
};
export type FieldWithType<TType, TFieldProps> = Omit<
  TFieldProps,
  "title" | "children" | "onChange"
> & {
  type: TType;
  // value: string;
  onChange?: (...event: unknown[]) => void;
};

// https://procomponents.ant.design/en-US/components/schema#valuetype-lists
export type InputUnion<TValue extends ValueType = string> =
  | FieldWithType<"checkbox", CheckboxProps>
  | FieldWithType<"date", DatePickerProps>
  | FieldWithType<"date-range", DateRangePickerProps>
  | FieldWithType<"radio-group", RadioGroupProps>
  | FieldWithType<"password", InputPasswordProps>
  | FieldWithType<"text", InputProps>
  // | FieldWithType<"number", FieldInputProps>
  | FieldWithType<"select", SelectProps<TValue>>
  | FieldWithType<"textarea", TextareaProps>;

type AutoFormFieldUnion<
  // TFieldValues,
  TFieldValues extends FieldValues = FieldValues,
  TValue extends ValueType = ValueType,
  // TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  // TFieldValues extends Record<string, any> = Record<string, any>,
  // TName extends keyof TFieldValues = keyof TFieldValues,
  // TFieldType extends FieldType = FieldType,
> = AutoFormFieldBaseProps &
  // | FieldWithType<"autocomplete", FieldAutoCompleteProps>
  // | FieldWithType<"checkbox", FieldCheckboxProps>
  // | FieldWithType<"date", FieldDatePickerProps>
  // | FieldWithType<"file", FieldUploadProps>
  // | FieldWithType<
  //     "list",
  //     FieldProps<TFieldValues, TName> & FieldArrayProps & X<TFieldValues[TName]>
  //     // & {
  //     //           // columns: Array<FieldsSchema<TFieldValues, TFieldValues[TName]FieldArrayPath<TFieldValues> >>;
  //     //           columns: Array<
  //     //             FieldsSchema<TFieldValues[TName], TFieldValues[TName]>
  //     //           >;
  //     //         }
  //   >

  // (| FieldWithType<"radio-group", FieldProps<TFieldValues> & RadioGroupProps>
  //   | FieldWithType<"text", FieldProps<TFieldValues> & InputProps>
  //   // | FieldWithType<"number", FieldInputProps>
  //   // | FieldWithType<"select", FieldProps<TFieldValues, TName> & SelectProps>
  //   | FieldWithType<"textarea", FieldProps<TFieldValues> & TextareaProps>
  // )
  Omit<FormItemProps<TFieldValues>, "children" | "control" | "name"> &
  InputUnion<TValue>;
// | FieldWithType<"time", FieldInputProps>
// | FieldWithType<"group", { gridCols?: number; columns: Array<FieldsSchema<TRecord>> }>
// | FieldWithType<"custom", unknown>
// | FieldWithType<"title", { title?: string }>
// | FieldWithType<"divider", BPLineProps>
// | FieldWithType<"address", FieldAddressGroupProps>
// | FieldWithType<"identification", FieldIdentificationGroupProps>
// | FieldWithType<"person", FieldContactPersonGroupProps>
// | FieldWithType<"phone", FieldPhoneGroupProps>;

// export type FieldsSchema<
//   // TFieldValues extends FieldValues = FieldValues,
//   // TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
//   TFieldValues extends Record<string, any> = Record<string, any>,
//   TName extends keyof TFieldValues = keyof TFieldValues,
// > = AutoFormFieldBaseProps<TFieldValues> &
//   AutoFormFieldUnion<TFieldValues, TName>;

// TFieldType extends FieldObjectType
//   ? {
//       type: TFieldType;
//       name: key;
//       label: string;
//       c: TFieldValues[key] extends (infer I)[]
//         ? FieldsSchema<I>[]
//         : // : keyof TFieldValues[key];
//           // FieldsSchema<TFieldValues>[];
//           string;
//     }
//   :
//
type FieldObjectType = "object";
type FieldInputType = InputUnion["type"];
type FieldGroupType = "group";
export type FieldType =
  | FieldInputType
  | FieldObjectType
  | "group"
  | "list"
  | "custom";
export type FieldsSchema<
  // TFieldValues,
  TFieldValues extends FieldValues = FieldValues,
  // TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TFieldType extends FieldType = FieldType,
> = {
  [key in keyof TFieldValues]: TFieldType extends "custom"
    ? {
        type: TFieldType;
        name?: never;
        render: () => void;
      }
    : TFieldType extends "group"
      ? {
          type: TFieldType;
          className?: string;
          columns: FieldsSchema<
            TFieldValues,
            Exclude<FieldType, FieldGroupType>
          >[];

          // to fix(list): Property 'name' does not exist on type 'never'
          name?: never;
        }
      : TFieldType extends "list"
        ? Omit<FormListProps, "children"> & {
            type: TFieldType;
            name?: key;
            // name: string;
            // label?: ReactNode;
            itemTitle?: string;
            appendProps?: {
              title?: string;
              defaultValue?: TFieldValues[key] extends (infer I)[]
                ? I
                : // : keyof TFieldValues[key];
                  TFieldValues;
            };
            fields: TFieldValues[key] extends (infer I)[]
              ? I extends FieldValues
                ? FieldsSchema<I>[]
                : [FieldsSchema<FieldValues>]
              : // : keyof TFieldValues[key];
                FieldsSchema<TFieldValues[key]>[];
            // FieldsSchema<TFieldValues[key]>[];
            // fields: FieldsSchema<TFieldValues[key]>[];
            // string[];
          }
        : AutoFormFieldUnion<TFieldValues, TFieldValues[key]> & {
            type: TFieldType;
            name?: key;
            // columns?: TFieldValues[key] extends (infer I)[]
            //   ? FieldsSchema<I>
            //   : keyof TFieldValues[key];
          };
  // : TFieldType extends FieldInputType
  //   ? AutoFormFieldUnion & {
  //       // type: TFieldType;
  //       name: key;
  //       // columns?: TFieldValues[key] extends (infer I)[]
  //       //   ? FieldsSchema<I>
  //       //   : keyof TFieldValues[key];
  //     }
  //   : {
  //       type: never;
  // };
}[keyof TFieldValues];
// type TestUser = {
//   name: string;
//   email: string;
//   houses: {
//     address: string;
//     rooms: {
//       floor: number;
//       color: string;
//       connectedTo: {
//         id: number;
//       }[];
//     }[];
//     doors: {
//       location: number;
//       size: number;
//     }[];
//   }[];
//   tasks: {
//     description: string;
//     people: {
//       nickname: string;
//     }[];
//   }[];
// };
//
// const x: FieldsSchema<TestUser> = {
//   type: "list",
//   name: "houses",
//   columns: [
//     {
//       type: "text",
//       name: "address",
//     },
//     {
//       type: "text",
//       name: "rooms",
//     },
//   ],
// };
//
//

export type ResetAction<TFieldValues> = (
  formValues: TFieldValues,
) => TFieldValues;

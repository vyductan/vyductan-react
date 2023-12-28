import type { FieldValues } from "react-hook-form";

import type { InputProps } from "../input";
import type { RadioGroupProps } from "../radio";
import type { TextareaProps } from "../textarea";
import type { FieldProps } from "./Field";
import type { FieldArrayProps } from "./FieldArray";

// https://procomponents.ant.design/en-US/components/schema#valuetype-lists
// type FieldType =
//   | "autocomplete"
//   | "checkbox"
//   | "date"
//   | "file"
//   | "list"
//   | "number"
//   | "radio-group"
//   | "select"
//   | "text"
//   | "textarea"
//   | "time"
//   | "custom"
//   | "group"
//   | "title"
//   | "divider"
//   | "address"
//   | "identification"
//   | "person"
//   | "phone";

type AutoFormFieldBaseProps = {
  // title?: ReactNode;

  className?: string;
  // disabled?: boolean | ((record: TFormValues) => boolean);
  // hidden?: boolean | ((record: TFormValues) => boolean);
  required?: boolean;

  // render?: (values: TFormValues) => React.ReactNode;
};
export type FieldWithType<TType extends FieldType, TFieldProps> = Omit<
  TFieldProps,
  "title" | "children"
> & {
  type: TType;
};

type AutoFormFieldUnion<
  // TFieldValues,
  TFieldValues extends FieldValues = FieldValues,
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
  (| FieldWithType<"radio-group", FieldProps<TFieldValues> & RadioGroupProps>
    | FieldWithType<"text", FieldProps<TFieldValues> & InputProps>
    // | FieldWithType<"number", FieldInputProps>
    // | FieldWithType<"select", FieldProps<TFieldValues, TName> & SelectProps>
    | FieldWithType<"textarea", FieldProps<TFieldValues> & TextareaProps>
  );
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
type FieldListType = "list";
type FieldObjectType = "object";
export const fieldInputTypes = ["radio-group", "text", "textarea"] as const;
export type FieldInputType = (typeof fieldInputTypes)[number];
export type FieldType = FieldInputType | FieldListType | FieldObjectType;
export type FieldsSchema<
  TFieldValues,
  // TFieldValues extends FieldValues = FieldValues,
  // TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TFieldType extends FieldType = FieldType,
> = {
  [key in keyof TFieldValues]: TFieldType extends FieldListType
    ? FieldArrayProps & {
        type: TFieldType;
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
    : AutoFormFieldUnion & {
        type: TFieldType;
        name: key;
        // columns?: TFieldValues[key] extends (infer I)[]
        //   ? FieldsSchema<I>
        //   : keyof TFieldValues[key];
      };
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

import type { InputProps as InternalInputProps } from "./input";
import { Textarea } from "../textarea";
import { Input as InternalInput } from "./input";
import { InputNumber } from "./number";
import { InputPassword } from "./password";
import { InputSearch } from "./search";

export * from "./input";
export * from "./number";
export * from "./password";
export * from "./search";
export * from "./types";
export * from "./variants";

type PublicInputType =
  | "button"
  | "checkbox"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "hidden"
  | "image"
  | "month"
  | "number"
  | "password"
  | "radio"
  | "range"
  | "reset"
  | "search"
  | "submit"
  | "tel"
  | "text"
  | "url"
  | "week";

type InputProps = Omit<InternalInputProps, "type"> & {
  type?: PublicInputType;
};

type CompoundedComponent = ((props: InputProps) => ReturnType<typeof InternalInput>) & {
  TextArea: typeof Textarea;
  Number: typeof InputNumber;
  Password: typeof InputPassword;
  Search: typeof InputSearch;
};

const Input = Object.assign(
  (props: InputProps) => <InternalInput {...props} />,
  {
    TextArea: Textarea,
    Number: InputNumber,
    Password: InputPassword,
    Search: InputSearch,
  },
) as CompoundedComponent;

export { Input };
export type { InputProps };

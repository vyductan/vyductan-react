import type { InputProps as InternalInputProperties } from "./input";
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

type InputProperties = Omit<InternalInputProperties, "type"> & {
  type?: PublicInputType;
};

type CompoundedComponent = ((
  properties: InputProperties,
) => ReturnType<typeof InternalInput>) & {
  TextArea: typeof Textarea;
  Number: typeof InputNumber;
  Password: typeof InputPassword;
  Search: typeof InputSearch;
};

const Input = Object.assign(
  (properties: InputProperties) => <InternalInput {...properties} />,
  {
    TextArea: Textarea,
    Number: InputNumber,
    Password: InputPassword,
    Search: InputSearch,
  },
) as CompoundedComponent;

export { Input };
export type { InputProperties as InputProps };

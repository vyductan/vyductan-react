import { Textarea } from "../textarea";
import { Input as InternalInput } from "./input";
import { InputNumber } from "./number";
import { InputPassword } from "./password";

export * from "./input";
export * from "./text";
export * from "./number";
export * from "./password";
export * from "./types";

type CompoundedComponent = typeof InternalInput & {
  TextArea: typeof Textarea;
  Number: typeof InputNumber;
  Password: typeof InputPassword;
};

const Input = InternalInput as CompoundedComponent;
Input.TextArea = Textarea;
Input.Number = InputNumber;
Input.Password = InputPassword;

export { Input };

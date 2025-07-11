import type { XOR } from "ts-xor";

import type { InputProps } from "./input";
import type { InputNumberProps, NumberValueType } from "./number";
import { Textarea } from "../textarea";
import { Input as InternalInput } from "./input";
import { InputNumber } from "./number";
import { InputPassword } from "./password";

export * from "./input";
export * from "./number";
export * from "./password";
export * from "./types";
export * from "./variants";

type CompoundedComponent = typeof InternalInput & {
  TextArea: typeof Textarea;
  Number: typeof InputNumber;
  Password: typeof InputPassword;
};

type ConditionTypeInputProps<
  TNumberValue extends NumberValueType = NumberValueType,
> = XOR<
  InputProps,
  {
    type: "number";
  } & InputNumberProps<TNumberValue>
>;
const ConditionTypeInput = <
  TNumberValue extends NumberValueType = NumberValueType,
>(
  props: ConditionTypeInputProps<TNumberValue>,
) => {
  if (props.type === "number") {
    const { type: _, ...restProps } = props as InputNumberProps<TNumberValue>;
    return <InputNumber {...restProps} />;
  }

  return <InternalInput {...(props as InputProps)} />;
};

const Input = ConditionTypeInput as CompoundedComponent;
Input.TextArea = Textarea;
Input.Number = InputNumber;
Input.Password = InputPassword;

export { Input };

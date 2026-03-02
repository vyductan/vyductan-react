import type { XOR } from "ts-xor";

import type { TimePickerProps } from "../time-picker";
import type { InputProps } from "./input";
import type { InputNumberProps, NumberValueType } from "./number";
import { Textarea } from "../textarea";
import { TimePicker } from "../time-picker";
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

type CompoundedComponent = typeof InternalInput & {
  TextArea: typeof Textarea;
  Number: typeof InputNumber;
  Password: typeof InputPassword;
  Search: typeof InputSearch;
};

type ConditionTypeInputProps<
  TNumberValue extends NumberValueType = NumberValueType,
> = XOR<
  InputProps,
  XOR<
    {
      type: "number";
    } & InputNumberProps<TNumberValue>,
    {
      type: "time";
    } & TimePickerProps
  >
>;
const ConditionTypeInput = <
  TNumberValue extends NumberValueType = NumberValueType,
>(
  props: ConditionTypeInputProps<TNumberValue>,
) => {
  if (props.type === "number") {
    const { type: _, ...restProps } = props as {
      type: "number";
    } & InputNumberProps<TNumberValue>;
    return <InputNumber {...restProps} />;
  }

  // When type="time", render TimePicker but keep the same onChange signature as a
  // regular <input> (React.ChangeEvent<HTMLInputElement>) so callers using
  // <Input type="time"> don't need to know about TimePicker's internal API.
  // We bridge the gap by constructing a synthetic event with e.target.value = timeStr.
  if (props.type === "time") {
    const {
      type: _,
      onChange,
      value,
      defaultValue,
      ...restProps
    } = props as {
      type: "time";
    } & InputProps;

    return (
      <TimePicker
        {...(restProps as TimePickerProps)}
        value={value ? String(value) : undefined}
        defaultValue={defaultValue ? String(defaultValue) : undefined}
        format="HH:mm"
        onChange={(_, timeStr) => {
          if (onChange) {
            const mockEvent = {
              target: { value: timeStr || "" },
              currentTarget: { value: timeStr || "" },
            };
            onChange(mockEvent as React.ChangeEvent<HTMLInputElement>);
          }
        }}
      />
    );
  }

  return <InternalInput {...(props as InputProps)} />;
};

const Input = ConditionTypeInput as CompoundedComponent;
Input.TextArea = Textarea;
Input.Number = InputNumber;
Input.Password = InputPassword;
Input.Search = InputSearch;

export { Input };

"use client";

import type { XOR } from "ts-xor";
import * as React from "react";

import type { ValueType } from "./_components/rc-input-number";
import type { InputNumberProps } from "./number";
import type { InputTextProps } from "./text";
import { InputNumber } from "./number";
import { InputText } from "./text";

type InputProps<TNumberValue extends ValueType = ValueType> = XOR<
  InputTextProps,
  {
    type: "number";
  } & InputNumberProps<TNumberValue>
>;
const Input = <TNumberValue extends ValueType = ValueType>(
  props: InputProps<TNumberValue>,
) => {
  if (props.type === "number") {
    const { type: _, ...restProps } = props as InputNumberProps<TNumberValue>;
    return <InputNumber {...restProps} />;
  }

  return <InputText {...(props as InputTextProps)} />;
};

export { Input };
export type { InputProps };

export { type InputVariants } from "./text";

import type { XOR } from "ts-xor";
import React from "react";

import type { AnyObject } from "../_util/type";
import type { SelectShadcnProps } from "./_components";
import type { SelectProps } from "./select";
import type { OptionType, SelectValueType } from "./types";
import { Select as ShadcnSelect } from "../../shadcn/select";
import { SelectContent, SelectTrigger } from "./_components";
import { Select as OwnSelect } from "./select";

type ConditionSelectProps<
  TValue extends SelectValueType = SelectValueType,
  // ValueType = any,
  TRecord extends AnyObject = AnyObject,
  // OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
  // > = XOR<SelectProps<TValue, OptionType>, SelectShadcnProps>;
> = XOR<SelectProps<TValue, OptionType<TValue, TRecord>>, SelectShadcnProps>;
const Select = <
  TValue extends SelectValueType = SelectValueType,
  // ValueType = any,
  TRecord extends AnyObject = AnyObject,
  // OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(
  props: ConditionSelectProps<TValue, TRecord>,
  // props: ConditionSelectProps<TValue, OptionType>,
) => {
  // ======================= SHADCN SELECT =======================
  const isShadcnSelect =
    React.Children.toArray(props.children).some(
      (child) =>
        React.isValidElement(child) &&
        (child.type === SelectContent || child.type === SelectTrigger),
    ) &&
    props.children &&
    !props.options;

  if (isShadcnSelect) return <ShadcnSelect {...props} />;

  // return <OwnSelect {...(props as SelectProps<TValue, OptionType>)} />;
  return <OwnSelect {...(props as SelectProps<TValue, TRecord>)} />;
};

export { Select };
export { Select as SelectRoot } from "../../shadcn/select";
export type { SelectProps } from "./select";

export * from "./_components";

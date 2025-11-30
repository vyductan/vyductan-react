import type { XOR } from "ts-xor";
import React from "react";

import type { AnyObject } from "../_util/type";
import type { SelectShadcnProps } from "./_components";
import type { SelectProps } from "./select";
import type { OptionType, SelectValueType } from "./types";
import { Select as ShadcnSelect } from "@acme/ui/shadcn/select";
import {
  SelectContent as Content,
  SelectContent,
  SelectTrigger,
  SelectTrigger as Trigger,
} from "./_components";
import { Option } from "./_components/option";
import { Select as OwnSelect } from "./select";

type ConditionSelectProps<
  TValue extends SelectValueType = SelectValueType,
  // ValueType = any,
  TRecord extends AnyObject = AnyObject,
  // OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
  // > = XOR<SelectProps<TValue, OptionType>, SelectShadcnProps>;
> = XOR<SelectProps<TValue, OptionType<TValue, TRecord>>, SelectShadcnProps>;
const ConditionSelect = <
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
    ) && !props.options;

  if (isShadcnSelect) return <ShadcnSelect {...(props as SelectShadcnProps)} />;

  return <OwnSelect {...(props as SelectProps<TValue, TRecord>)} />;
};

type CompoundedSelect = typeof ConditionSelect & {
  Option: typeof Option;
  Trigger: typeof Trigger;
  Content: typeof Content;
};

const Select = ConditionSelect as CompoundedSelect;
Select.Option = Option;
Select.Trigger = Trigger;
Select.Content = Content;

export { Select };
export { Select as SelectRoot } from "@acme/ui/shadcn/select";
export type { SelectProps } from "./select";

export * from "./_components";
export { Option } from "./_components/option";

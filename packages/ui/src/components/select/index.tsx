import type { XOR } from "ts-xor";
import React from "react";

import type { AnyObject } from "../_util/type";
import type { SelectShadcnProps as SelectShadcnProperties } from "./_components";
import type { SelectProps as SelectProperties } from "./select";
import type { OptionType, SelectValueType } from "./types";
import {
  SelectContent as Content,
  SelectContent,
  SelectTrigger,
  Select as ShadcnSelect,
  SelectTrigger as Trigger,
} from "./_components";
import { Option } from "./_components/option";
import { Select as OwnSelect } from "./select";

type ConditionSelectProperties<
  TValue extends SelectValueType = SelectValueType,
  // ValueType = any,
  TRecord extends AnyObject = AnyObject,
  // OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
  // > = XOR<SelectProps<TValue, OptionType>, SelectShadcnProps>;
> = XOR<
  SelectProperties<TValue, OptionType<TValue, TRecord>>,
  SelectShadcnProperties
>;
const ConditionSelect = <
  TValue extends SelectValueType = SelectValueType,
  // ValueType = any,
  TRecord extends AnyObject = AnyObject,
  // OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(
  properties: ConditionSelectProperties<TValue, TRecord>,
  // props: ConditionSelectProps<TValue, OptionType>,
) => {
  // ======================= SHADCN SELECT =======================
  const isShadcnSelect =
    React.Children.toArray(properties.children).some(
      (child) =>
        React.isValidElement(child) &&
        (child.type === SelectContent || child.type === SelectTrigger),
    ) && !properties.options;

  if (isShadcnSelect)
    return <ShadcnSelect {...(properties as SelectShadcnProperties)} />;

  return <OwnSelect {...(properties as SelectProperties<TValue, TRecord>)} />;
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
export type { SelectProps } from "./select";

export {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectTrigger,
  SelectValue,
} from "./_components";
export { Option } from "./_components/option";

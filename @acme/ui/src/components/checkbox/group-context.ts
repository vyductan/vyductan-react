import React from "react";

import type { FormValueType } from "../form";
import type { CheckboxOptionType } from "./checkbox-group";

export interface CheckboxGroupContext<
  TValue extends FormValueType = FormValueType,
> {
  name?: string;
  toggleOption?: (option: CheckboxOptionType<TValue>) => void;
  value?: TValue[];
  disabled?: boolean;
  registerValue: (val: TValue) => void;
  cancelValue: (val: TValue) => void;
}

const GroupContext =
  React.createContext<CheckboxGroupContext<FormValueType> | null>(null);

export default GroupContext;

import React from "react";

import type { CheckboxOptionType } from "./checkbox-group";

export type CheckboxValueType = string | number | boolean;

export interface CheckboxGroupContext<
  TValue extends CheckboxValueType = CheckboxValueType,
> {
  name?: string;
  toggleOption?: (option: CheckboxOptionType<TValue>) => void;
  value?: TValue[];
  disabled?: boolean;
  registerValue: (value: TValue) => void;
  cancelValue: (value: TValue) => void;
}

const GroupContext = React.createContext<
  CheckboxGroupContext<CheckboxValueType> | undefined
>(undefined);

export default GroupContext;

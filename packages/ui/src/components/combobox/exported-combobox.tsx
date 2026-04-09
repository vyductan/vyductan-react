import * as React from "react";

import type { AnyObject } from "../_util/type";
import type { SelectValueType } from "../select/types";
import { Combobox as PublicCombobox } from "./combobox";
import type { ComboboxProps as PublicComboboxProps } from "./combobox";
import { ComboboxPrimitive } from "./primitive-combobox";

type PrimitiveComboboxProps<
  Value = string,
  Multiple extends boolean | undefined = false,
> = React.ComponentProps<typeof ComboboxPrimitive<Value, Multiple>>;

type ExportedComboboxProps<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
  Value = string,
  Multiple extends boolean | undefined = false,
> =
  | PublicComboboxProps<TValue, TRecord>
  | PrimitiveComboboxProps<Value, Multiple>;

const isPublicComboboxProps = <
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
  Value = string,
  Multiple extends boolean | undefined = false,
>(
  props: ExportedComboboxProps<TValue, TRecord, Value, Multiple>,
): props is PublicComboboxProps<TValue, TRecord> => {
  return "options" in props;
};

function Combobox<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
>(props: PublicComboboxProps<TValue, TRecord>): React.JSX.Element;
function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: PrimitiveComboboxProps<Value, Multiple>,
): React.JSX.Element;
function Combobox<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
  Value = string,
  Multiple extends boolean | undefined = false,
>(
  props: ExportedComboboxProps<TValue, TRecord, Value, Multiple>,
): React.JSX.Element {
  if (isPublicComboboxProps(props)) {
    return <PublicCombobox {...props} />;
  }

  return <ComboboxPrimitive {...props} />;
}

export { Combobox };

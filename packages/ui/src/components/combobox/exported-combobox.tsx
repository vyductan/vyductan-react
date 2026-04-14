import type * as React from "react";

import type { AnyObject } from "../_util/type";
import type { SelectValueType } from "../select/types";
import type { ComboboxProps as PublicComboboxProperties } from "./combobox";
import { Combobox as PublicCombobox } from "./combobox";
import { ComboboxPrimitive } from "./primitive-combobox";

type PrimitiveComboboxProperties<
  Value = string,
  Multiple extends boolean | undefined = false,
> = React.ComponentProps<typeof ComboboxPrimitive<Value, Multiple>>;

type ExportedComboboxProperties<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
  Value = string,
  Multiple extends boolean | undefined = false,
> =
  | PublicComboboxProperties<TValue, TRecord>
  | PrimitiveComboboxProperties<Value, Multiple>;

const isPublicComboboxProperties = <
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
  Value = string,
  Multiple extends boolean | undefined = false,
>(
  properties: ExportedComboboxProperties<TValue, TRecord, Value, Multiple>,
): properties is PublicComboboxProperties<TValue, TRecord> => {
  return "options" in properties;
};

function Combobox<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
>(properties: PublicComboboxProperties<TValue, TRecord>): React.JSX.Element;
function Combobox<Value, Multiple extends boolean | undefined = false>(
  properties: PrimitiveComboboxProperties<Value, Multiple>,
): React.JSX.Element;
function Combobox<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
  Value = string,
  Multiple extends boolean | undefined = false,
>(
  properties: ExportedComboboxProperties<TValue, TRecord, Value, Multiple>,
): React.JSX.Element {
  if (isPublicComboboxProperties(properties)) {
    return <PublicCombobox {...properties} />;
  }

  return <ComboboxPrimitive {...properties} />;
}

export { Combobox };

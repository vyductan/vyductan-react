import type { AnyObject } from "../_util/type";

export type OptionType<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = {
  label?: React.ReactNode;
  value: TValue;
  icon?: string;
  color?: string;
  checked?: boolean;
  className?: string;
  onSelect?: () => void;
} & TRecord;

export type GroupOptionType<TValue extends SelectValueType = SelectValueType> =
  {
    label: React.ReactNode;
    title?: string;
    options: OptionType<TValue>[];
  };

/** A single option or a group of options */
export type SelectOption<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = OptionType<TValue, TRecord> | GroupOptionType<TValue>;

export type SelectValueType = string | number;

export interface FlattenOptionData<TOption> {
  label?: React.ReactNode;
  data: TOption;
  key: React.Key;
  value?: SelectValueType;
  groupOption?: boolean;
  group?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RenderNode = React.ReactNode | ((props: any) => React.ReactNode);

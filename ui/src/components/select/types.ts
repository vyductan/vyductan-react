import type { AnyObject } from "../_util/type";

// export interface BaseOptionType {
//   disabled?: boolean;
//   className?: string;
//   title?: string;
//   color?: string;
//   [name: string]: any;
// }

// export interface DefaultOptionType extends BaseOptionType {
//   label?: React.ReactNode;
//   value?: string | number | null;
//   children?: Omit<DefaultOptionType, "children">[];
// }

export type OptionType<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = {
  label: React.ReactNode;
  value: TValue;
  icon?: string;
  color?: string;
  checked?: boolean;
  className?: string;
  onSelect?: () => void;
} & TRecord;

export type SelectValueType = string | number;

// export interface DisplayValueType {
//   key?: React.Key;
//   value?: SelectValueType;
//   label?: React.ReactNode;
//   title?: React.ReactNode;
//   disabled?: boolean;
//   index?: number;
// }
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

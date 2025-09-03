/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable unicorn/no-array-for-each */
import * as React from "react";

import type { FilterState } from ".";
import type { AnyObject } from "../../../_util/type";
import type { FieldDataNode } from "../../../tree";
import type {
  ColumnFilterItem,
  ColumnType,
  FilterSearchType,
  FilterValue,
  GetPopupContainer,
  Key,
  TableLocale,
} from "../../types";

type FilterTreeDataNode = FieldDataNode<{
  title: React.ReactNode;
  key: string;
}>;

export function flattenKeys(filters?: ColumnFilterItem[]) {
  let keys: FilterValue = [];
  (filters || []).forEach(({ value, children }) => {
    keys.push(value);
    if (children) {
      keys = [...keys, ...flattenKeys(children)];
    }
  });
  return keys;
}

export type TreeColumnFilterItem = ColumnFilterItem & FilterTreeDataNode;

export interface FilterDropdownProps<RecordType = AnyObject> {
  column: ColumnType<RecordType>;
  filterState?: FilterState<RecordType>;
  filterOnClose: boolean;
  filterMultiple: boolean;
  filterMode?: "menu" | "tree";
  filterSearch?: FilterSearchType<ColumnFilterItem | TreeColumnFilterItem>;
  columnKey: Key;
  children: React.ReactNode;
  triggerFilter: (filterState: FilterState<RecordType>) => void;
  locale: TableLocale;
  getPopupContainer?: GetPopupContainer;
  filterResetToDefaultFilteredValue?: boolean;
  rootClassName?: string;
}

const FilterDropdown = <RecordType extends AnyObject = AnyObject>(
  _props: FilterDropdownProps<RecordType>,
) => {
  return <>Filter Dropdown</>;
};

export default FilterDropdown;

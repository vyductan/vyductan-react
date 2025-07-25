/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable unicorn/no-negated-condition */
/* eslint-disable unicorn/explicit-length-check */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable unicorn/no-array-reduce */
import React from "react";

import type { AnyObject } from "../../../_util/type";
import type { SafeKey } from "../../../tree";
import type {
  ColumnsType,
  ColumnTitleProps,
  ColumnType,
  FilterKey,
  FilterValue,
  GetPopupContainer,
  Key,
  TableLocale,
  TransformColumns,
} from "../../types";
import { devUseWarning } from "../../../_util/warning";
import { getColumnKey, getColumnPos, renderColumnTitle } from "../../util";
import FilterDropdown, { flattenKeys } from "./filter-dropdown";

export interface FilterState<RecordType = AnyObject> {
  column: ColumnType<RecordType>;
  key: Key;
  filteredKeys?: FilterKey;
  forceFiltered?: boolean;
}

const collectFilterStates = <RecordType extends AnyObject = AnyObject>(
  columns: ColumnsType<RecordType>,
  init: boolean,
  pos?: string,
): FilterState<RecordType>[] => {
  let filterStates: FilterState<RecordType>[] = [];

  (columns || []).forEach((column, index) => {
    const columnPos = getColumnPos(index, pos);
    const filterDropdownIsDefined = column.filterDropdown !== undefined;

    if (column.filters || filterDropdownIsDefined || "onFilter" in column) {
      if ("filteredValue" in column) {
        // Controlled
        let filteredValues = column.filteredValue;
        if (!filterDropdownIsDefined) {
          filteredValues = filteredValues?.map(String) ?? filteredValues;
        }
        filterStates.push({
          column,
          key: getColumnKey(column, columnPos),
          filteredKeys: filteredValues as FilterKey,
          forceFiltered: column.filtered,
        });
      } else {
        // Uncontrolled
        filterStates.push({
          column,
          key: getColumnKey(column, columnPos),
          filteredKeys: (init && column.defaultFilteredValue
            ? column.defaultFilteredValue!
            : undefined) as FilterKey,
          forceFiltered: column.filtered,
        });
      }
    }

    if ("children" in column) {
      filterStates = [
        ...filterStates,
        ...collectFilterStates(column.children, init, columnPos),
      ];
    }
  });

  return filterStates;
};

function injectFilter<RecordType extends AnyObject = AnyObject>(
  columns: ColumnsType<RecordType>,
  filterStates: FilterState<RecordType>[],
  locale: TableLocale,
  triggerFilter: (filterState: FilterState<RecordType>) => void,
  getPopupContainer?: GetPopupContainer,
  pos?: string,
  rootClassName?: string,
): ColumnsType<RecordType> {
  return columns.map((column, index) => {
    const columnPos = getColumnPos(index, pos);
    const {
      filterOnClose = true,
      filterMultiple = true,
      filterMode,
      filterSearch,
    } = column as ColumnType<RecordType>;

    let newColumn: ColumnsType<RecordType>[number] = column;

    if (newColumn.filters || newColumn.filterDropdown) {
      const columnKey = getColumnKey(newColumn, columnPos);
      const filterState = filterStates.find(({ key }) => columnKey === key);

      newColumn = {
        ...newColumn,
        title: (renderProps: ColumnTitleProps<RecordType>) => (
          <FilterDropdown
            column={newColumn}
            columnKey={columnKey}
            filterState={filterState}
            filterOnClose={filterOnClose}
            filterMultiple={filterMultiple}
            filterMode={filterMode}
            filterSearch={filterSearch}
            triggerFilter={triggerFilter}
            locale={locale}
            getPopupContainer={getPopupContainer}
            rootClassName={rootClassName}
          >
            {renderColumnTitle<RecordType>(column.title, renderProps)}
          </FilterDropdown>
        ),
      };
    }

    if ("children" in newColumn) {
      newColumn = {
        ...newColumn,
        children: injectFilter(
          newColumn.children,
          filterStates,
          locale,
          triggerFilter,
          getPopupContainer,
          columnPos,
          rootClassName,
        ),
      };
    }

    return newColumn;
  });
}

const generateFilterInfo = <RecordType extends AnyObject = AnyObject>(
  filterStates: FilterState<RecordType>[],
) => {
  const currentFilters: Record<string, FilterValue | null> = {};

  filterStates.forEach(({ key, filteredKeys, column }) => {
    const keyAsString = key as SafeKey;
    const { filters, filterDropdown } = column;
    if (filterDropdown) {
      currentFilters[keyAsString] = filteredKeys || null;
    } else if (Array.isArray(filteredKeys)) {
      const keys = flattenKeys(filters);
      currentFilters[keyAsString] = keys.filter((originKey) =>
        filteredKeys.includes(String(originKey)),
      );
    } else {
      currentFilters[keyAsString] = null;
    }
  });

  return currentFilters;
};

export const getFilterData = <RecordType extends AnyObject = AnyObject>(
  data: RecordType[],
  filterStates: FilterState<RecordType>[],
  childrenColumnName: string,
) => {
  const filterDatas = filterStates.reduce<RecordType[]>(
    (currentData, filterState) => {
      const {
        column: { onFilter, filters },
        filteredKeys,
      } = filterState;
      if (onFilter && filteredKeys && filteredKeys.length) {
        return (
          currentData
            // shallow copy
            .map((record) => ({ ...record }))
            .filter((record: any) =>
              filteredKeys.some((key) => {
                const keys = flattenKeys(filters);
                const keyIndex = keys.findIndex(
                  (k) => String(k) === String(key),
                );
                const realKey = keyIndex !== -1 ? keys[keyIndex]! : key;

                // filter children
                if (record[childrenColumnName]) {
                  record[childrenColumnName] = getFilterData(
                    record[childrenColumnName],
                    filterStates,
                    childrenColumnName,
                  );
                }

                return onFilter(realKey, record);
              }),
            )
        );
      }
      return currentData;
    },
    data,
  );
  return filterDatas;
};

export interface FilterConfig<RecordType = AnyObject> {
  mergedColumns: ColumnsType<RecordType>;
  locale: TableLocale;
  onFilterChange: (
    filters: Record<string, FilterValue | null>,
    filterStates: FilterState<RecordType>[],
  ) => void;
  getPopupContainer?: GetPopupContainer;
  rootClassName?: string;
}

const getMergedColumns = <RecordType extends AnyObject = AnyObject>(
  rawMergedColumns: ColumnsType<RecordType>,
): ColumnsType<RecordType> =>
  rawMergedColumns.flatMap((column) => {
    if ("children" in column) {
      return [column, ...getMergedColumns<RecordType>(column.children || [])];
    }
    return [column];
  });

const useFilter = <RecordType extends AnyObject = AnyObject>(
  props: FilterConfig<RecordType>,
): [
  TransformColumns<RecordType>,
  FilterState<RecordType>[],
  Record<string, FilterValue | null>,
] => {
  const {
    mergedColumns: rawMergedColumns,
    onFilterChange,
    getPopupContainer,
    locale: tableLocale,
    rootClassName,
  } = props;
  const warning = devUseWarning("Table");

  const mergedColumns = React.useMemo(
    () => getMergedColumns<RecordType>(rawMergedColumns || []),
    [rawMergedColumns],
  );

  const [filterStates, setFilterStates] = React.useState<
    FilterState<RecordType>[]
  >(() => collectFilterStates(mergedColumns, true));

  const mergedFilterStates = React.useMemo(() => {
    const collectedStates = collectFilterStates(mergedColumns, false);
    if (collectedStates.length === 0) {
      return collectedStates;
    }
    let filteredKeysIsAllNotControlled = true;
    let filteredKeysIsAllControlled = true;
    for (const { filteredKeys } of collectedStates) {
      if (filteredKeys !== undefined) {
        filteredKeysIsAllNotControlled = false;
      } else {
        filteredKeysIsAllControlled = false;
      }
    }

    // Return if not controlled
    if (filteredKeysIsAllNotControlled) {
      // Filter column may have been removed
      const keyList = (mergedColumns || []).map((column, index) =>
        getColumnKey(column, getColumnPos(index)),
      );
      return filterStates
        .filter(({ key }) => keyList.includes(key))
        .map((item) => {
          const col = mergedColumns[keyList.indexOf(item.key)]!;
          return {
            ...item,
            column: {
              ...item.column,
              ...col,
            },
            forceFiltered: col.filtered,
          };
        });
    }

    warning(
      filteredKeysIsAllControlled,
      "usage",
      "Columns should all contain `filteredValue` or not contain `filteredValue`.",
    );

    return collectedStates;
  }, [mergedColumns, filterStates, warning]);

  const filters = React.useMemo(
    () => generateFilterInfo<RecordType>(mergedFilterStates),
    [mergedFilterStates],
  );

  const triggerFilter = (filterState: FilterState<RecordType>) => {
    const newFilterStates = mergedFilterStates.filter(
      ({ key }) => key !== filterState.key,
    );
    newFilterStates.push(filterState);
    setFilterStates(newFilterStates);
    onFilterChange(
      generateFilterInfo<RecordType>(newFilterStates),
      newFilterStates,
    );
  };

  const transformColumns = (innerColumns: ColumnsType<RecordType>) =>
    injectFilter(
      innerColumns,
      mergedFilterStates,
      tableLocale,
      triggerFilter,
      getPopupContainer,
      undefined,
      rootClassName,
    );

  return [transformColumns, mergedFilterStates, filters] as const;
};

export default useFilter;
export { flattenKeys } from "./filter-dropdown";

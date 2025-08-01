/* eslint-disable unicorn/prefer-ternary */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable unicorn/no-array-callback-reference */
/* eslint-disable react-hooks/react-compiler */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable unicorn/explicit-length-check */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import React from "react";
import KeyCode from "@rc-component/util/lib/KeyCode";

import type { AnyObject } from "../../_util/type";
import type { TooltipProps } from "../../tooltip";
import type {
  ColumnGroupType,
  ColumnsType,
  ColumnTitleProps,
  ColumnType,
  Key,
  SorterResult,
  SorterTooltipProps,
  SortOrder,
  TableLocale,
  TransformColumns,
} from "../types";
import { Icon } from "../../../icons";
import { cn } from "../../../lib/utils";
import { Tooltip } from "../../tooltip";
import {
  getColumnKey,
  getColumnPos,
  renderColumnTitle,
  safeColumnTitle,
} from "../util";

const ASCEND = "ascend";
const DESCEND = "descend";

const getMultiplePriority = <RecordType extends AnyObject = AnyObject>(
  column: ColumnType<RecordType>,
): number | false => {
  if (
    typeof column.sorter === "object" &&
    typeof column.sorter.multiple === "number"
  ) {
    return column.sorter.multiple;
  }
  return false;
};

const nextSortDirection = (
  sortDirections: SortOrder[],
  current: SortOrder | null,
) => {
  if (!current) {
    return sortDirections[0]!;
  }
  return sortDirections[sortDirections.indexOf(current) + 1]!;
};

export interface SortState<RecordType = AnyObject> {
  column: ColumnType<RecordType>;
  key: Key;
  sortOrder: SortOrder | null;
  multiplePriority: number | false;
}

const collectSortStates = <RecordType extends AnyObject = AnyObject>(
  columns: ColumnsType<RecordType>,
  init: boolean,
  pos?: string,
): SortState<RecordType>[] => {
  let sortStates: SortState<RecordType>[] = [];

  const pushState = (
    column: ColumnsType<RecordType>[number],
    columnPos: string,
  ) => {
    sortStates.push({
      column: column as ColumnType<RecordType>,
      key: getColumnKey<RecordType>(
        column as ColumnType<RecordType>,
        columnPos,
      ),
      multiplePriority: getMultiplePriority<RecordType>(
        column as ColumnType<RecordType>,
      ),
      sortOrder: (column as ColumnType<RecordType>).sortOrder!,
    });
  };

  for (const [index, column] of (columns || []).entries()) {
    const columnPos = getColumnPos(index, pos);
    if ((column as ColumnGroupType<RecordType>).children) {
      if ("sortOrder" in column) {
        // Controlled
        pushState(column, columnPos);
      }
      sortStates = [
        ...sortStates,
        ...collectSortStates<RecordType>(
          (column as ColumnGroupType<RecordType>).children,
          init,
          columnPos,
        ),
      ];
    } else if (column.sorter) {
      if ("sortOrder" in column) {
        // Controlled
        pushState(column, columnPos);
      } else if (init && column.defaultSortOrder) {
        // Default sorter
        sortStates.push({
          column,
          key: getColumnKey(column, columnPos),
          multiplePriority: getMultiplePriority<RecordType>(column),
          sortOrder: column.defaultSortOrder,
        });
      }
    }
  }

  return sortStates;
};

const injectSorter = <RecordType extends AnyObject = AnyObject>(
  columns: ColumnsType<RecordType>,
  sorterStates: SortState<RecordType>[],
  triggerSorter: (sorterSates: SortState<RecordType>) => void,
  defaultSortDirections: SortOrder[],
  tableLocale?: TableLocale,
  tableShowSorterTooltip?: boolean | SorterTooltipProps,
  pos?: string,
): ColumnsType<RecordType> => {
  const _finalColumns = (columns || []).map((column, index) => {
    const columnPos = getColumnPos(index, pos);
    let newColumn: ColumnsType<RecordType>[number] = column;
    if (newColumn.sorter) {
      const sortDirections: SortOrder[] =
        newColumn.sortDirections || defaultSortDirections;
      const showSorterTooltip =
        newColumn.showSorterTooltip === undefined
          ? tableShowSorterTooltip
          : newColumn.showSorterTooltip;

      const columnKey = getColumnKey(newColumn, columnPos);
      const sorterState = sorterStates.find(({ key }) => key === columnKey);
      const sortOrder = sorterState ? sorterState.sortOrder : null;
      const nextSortOrder = nextSortDirection(sortDirections, sortOrder);

      let sorter: React.ReactNode;
      if (column.sortIcon) {
        sorter = column.sortIcon({ sortOrder });
      } else {
        const upNode: React.ReactNode = sortDirections.includes(ASCEND) && (
          <Icon
            icon="icon-[ant-design--caret-down-outlined]"
            className={cn(`column-sorter-up`, {
              active: sortOrder === ASCEND,
            })}
          />
        );
        const downNode: React.ReactNode = sortDirections.includes(DESCEND) && (
          <Icon
            icon="icon-[ant-design--caret-down-outlined]"
            className={cn(`column-sorter-down`, {
              active: sortOrder === DESCEND,
            })}
          />
        );
        sorter = (
          <span
            className={cn(`column-sorter`, {
              "column-sorter-full": !!(upNode && downNode),
            })}
          >
            <span className="column-sorter-inner" aria-hidden="true">
              {upNode}
              {downNode}
            </span>
          </span>
        );
      }

      const { cancelSort, triggerAsc, triggerDesc } = tableLocale || {};
      let sortTip: string | undefined = cancelSort;
      if (nextSortOrder === DESCEND) {
        sortTip = triggerDesc;
      } else if (nextSortOrder === ASCEND) {
        sortTip = triggerAsc;
      }
      const tooltipProps: TooltipProps =
        typeof showSorterTooltip === "object"
          ? {
              title: sortTip,
              ...showSorterTooltip,
            }
          : { title: sortTip };
      newColumn = {
        ...newColumn,
        className: cn(newColumn.className, { "column-sort": sortOrder }),
        title: (renderProps: ColumnTitleProps<RecordType>) => {
          const columnSortersClass = "column-sorters";
          const renderColumnTitleWrapper = (
            <span className="column-title">
              {renderColumnTitle(column.title, renderProps)}
            </span>
          );
          const renderSortTitle = (
            <div className={columnSortersClass}>
              {renderColumnTitleWrapper}
              {sorter}
            </div>
          );
          if (showSorterTooltip) {
            if (
              typeof showSorterTooltip !== "boolean" &&
              showSorterTooltip?.target === "sorter-icon"
            ) {
              return (
                <div
                  className={cn(
                    `${columnSortersClass} column-sorters-tooltip-target-sorter`,
                  )}
                >
                  {renderColumnTitleWrapper}
                  <Tooltip {...tooltipProps}>{sorter}</Tooltip>
                </div>
              );
            }
            return <Tooltip {...tooltipProps}>{renderSortTitle}</Tooltip>;
          }
          return renderSortTitle;
        },
        onHeaderCell: (col) => {
          const cell: React.HTMLAttributes<HTMLElement> =
            column.onHeaderCell?.(col) || {};
          const originOnClick = cell.onClick;
          const originOKeyDown = cell.onKeyDown;
          cell.onClick = (event: React.MouseEvent<HTMLElement>) => {
            triggerSorter({
              column,
              key: columnKey,
              sortOrder: nextSortOrder,
              multiplePriority: getMultiplePriority<RecordType>(column),
            });
            originOnClick?.(event);
          };
          cell.onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
            if (event.keyCode === KeyCode.ENTER) {
              triggerSorter({
                column,
                key: columnKey,
                sortOrder: nextSortOrder,
                multiplePriority: getMultiplePriority<RecordType>(column),
              });
              originOKeyDown?.(event);
            }
          };

          const renderTitle = safeColumnTitle(column.title, {});
          const displayTitle = renderTitle?.toString();

          // Inform the screen-reader so it can tell the visually impaired user which column is sorted
          if (sortOrder) {
            cell["aria-sort"] =
              sortOrder === "ascend" ? "ascending" : "descending";
          }
          cell["aria-label"] = displayTitle || "";
          cell.className = cn(cell.className, "column-has-sorters");
          cell.tabIndex = 0;
          if (column.ellipsis) {
            cell.title = (renderTitle ?? "").toString();
          }
          return cell;
        },
      };
    }

    if ("children" in newColumn) {
      newColumn = {
        ...newColumn,
        children: injectSorter(
          newColumn.children,
          sorterStates,
          triggerSorter,
          defaultSortDirections,
          tableLocale,
          tableShowSorterTooltip,
          columnPos,
        ),
      };
    }

    return newColumn;
  });
  return columns;
};

const stateToInfo = <RecordType extends AnyObject = AnyObject>(
  sorterState: SortState<RecordType>,
): SorterResult<RecordType> => {
  const { column, sortOrder } = sorterState;
  return {
    column,
    order: sortOrder,
    field: column.dataIndex as SorterResult<RecordType>["field"],
    columnKey: column.key,
  };
};
const generateSorterInfo = <RecordType extends AnyObject = AnyObject>(
  sorterStates: SortState<RecordType>[],
): SorterResult<RecordType> | SorterResult<RecordType>[] => {
  const activeSorters = sorterStates
    .filter(({ sortOrder }) => sortOrder)
    .map<SorterResult<RecordType>>(stateToInfo);

  // =========== Legacy compatible support ===========
  // https://github.com/ant-design/ant-design/pull/19226
  if (activeSorters.length === 0 && sorterStates.length > 0) {
    const lastIndex = sorterStates.length - 1;
    return {
      ...stateToInfo(sorterStates[lastIndex]!),
      column: undefined,
      order: undefined,
      field: undefined,
      columnKey: undefined,
    };
  }

  if (activeSorters.length <= 1) {
    return activeSorters[0] || {};
  }

  return activeSorters;
};

interface SorterConfig<RecordType = AnyObject> {
  mergedColumns: ColumnsType<RecordType>;
  onSorterChange: (
    sorterResult: SorterResult<RecordType> | SorterResult<RecordType>[],
    sortStates: SortState<RecordType>[],
  ) => void;
  sortDirections: SortOrder[];
  tableLocale?: TableLocale;
  showSorterTooltip?: boolean | SorterTooltipProps;
}

export const useFilterSorter = <RecordType extends AnyObject = AnyObject>(
  props: SorterConfig<RecordType>,
): [
  SortingState,
  OnChangeFn<SortingState>,
  TransformColumns<RecordType>,
  SortState<RecordType>[],
  ColumnTitleProps<RecordType>,
  () => SorterResult<RecordType> | SorterResult<RecordType>[],
] => {
  const {
    mergedColumns,
    sortDirections,
    tableLocale,
    showSorterTooltip,
    onSorterChange,
  } = props;

  const [sortStates, setSortStates] = React.useState<SortState<RecordType>[]>(
    () => collectSortStates<RecordType>(mergedColumns, true),
  );

  // Calculate initial sorting state from columns with defaultSortOrder
  const initialSortingState: SortingState = React.useMemo(() => {
    const sortingColumns: SortingState = [];

    // Use collectSortStates to properly extract columns with defaultSortOrder
    const sortStates = collectSortStates<RecordType>(mergedColumns, true);

    for (const sortState of sortStates) {
      if (sortState.sortOrder) {
        sortingColumns.push({
          id: sortState.key as string,
          desc: sortState.sortOrder === "descend",
        });
      }
    }

    return sortingColumns;
  }, [mergedColumns]);

  const [sortingState, setSortingState] =
    React.useState<SortingState>(initialSortingState);

  // Update sortingState when columns change with defaultSortOrder
  React.useEffect(() => {
    const sortingColumns: SortingState = [];

    // Use collectSortStates to properly extract columns with defaultSortOrder
    const sortStates = collectSortStates<RecordType>(mergedColumns, true);

    for (const sortState of sortStates) {
      if (sortState.sortOrder) {
        sortingColumns.push({
          id: sortState.key as string,
          desc: sortState.sortOrder === "descend",
        });
      }
    }

    setSortingState(sortingColumns);
  }, [mergedColumns]);

  const handleSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updaterOrValue) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sortingState)
          : updaterOrValue;

      setSortingState(newSorting);

      const updatedSortStates: SortState<RecordType>[] = [];
      const sorterResults: SorterResult<RecordType>[] = [];

      for (const [_index, sort] of newSorting.entries()) {
        const column = mergedColumns.find((col) => col.key === sort.id);
        if (!column) continue;
        const order = sort.desc ? "descend" : "ascend";
        const sorterResult: SorterResult<RecordType> = {
          column,
          columnKey: column.key as Key,
          field: (column as ColumnType<RecordType>).dataIndex as Key,
          order,
        };

        updatedSortStates.push({
          column,
          key: sort.id,
          sortOrder: order,
          multiplePriority:
            typeof column.sorter === "object"
              ? (column.sorter.multiple ?? false)
              : false,
        });
        sorterResults.push(sorterResult);
      }

      setSortStates(updatedSortStates);

      if (sorterResults.length <= 1) {
        onSorterChange(sorterResults[0]!, updatedSortStates);
      } else {
        onSorterChange(sorterResults, updatedSortStates);
      }
    },
    [mergedColumns, sortingState, onSorterChange],
  );

  const triggerSorter = React.useCallback(
    (sortState: SortState<RecordType>) => {
      let newSorterStates: SortState<RecordType>[];
      if (
        sortState.multiplePriority === false ||
        !sortStates.length ||
        sortStates[0]?.multiplePriority === false
      ) {
        newSorterStates = [sortState];
      } else {
        newSorterStates = [
          ...sortStates.filter(({ key }) => key !== sortState.key),
          sortState,
        ];
      }
      setSortStates(newSorterStates);
      onSorterChange(generateSorterInfo(newSorterStates), newSorterStates);
    },
    [sortStates, onSorterChange],
  );

  const columnTitleSorterProps = React.useMemo<
    ColumnTitleProps<RecordType>
  >(() => {
    const sortColumns = sortStates.map(({ column, sortOrder }) => ({
      column,
      order: sortOrder,
    }));

    return {
      sortColumns,
      // Legacy
      sortColumn: sortColumns[0]?.column,
      sortOrder: sortColumns[0]?.order,
    };
  }, [sortStates]);

  const transformColumns = React.useCallback(
    (innerColumns: ColumnsType<RecordType>) =>
      injectSorter<RecordType>(
        innerColumns,
        sortStates,
        triggerSorter,
        sortDirections,
        tableLocale,
        showSorterTooltip,
      ),
    [sortStates, sortDirections, tableLocale, showSorterTooltip],
  );

  const getSorters = React.useCallback(
    () => generateSorterInfo<RecordType>(sortStates),
    [sortStates],
  );

  return [
    sortingState,
    handleSortingChange,
    transformColumns,
    sortStates,
    columnTitleSorterProps,
    getSorters,
  ];
};

export default useFilterSorter;

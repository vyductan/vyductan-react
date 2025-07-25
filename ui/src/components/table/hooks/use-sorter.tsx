/* eslint-disable unicorn/prefer-ternary */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable unicorn/no-array-callback-reference */
/* eslint-disable react-hooks/react-compiler */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable unicorn/explicit-length-check */
/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import React from "react";
import { useMergedState } from "@rc-component/util";
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

  const collectedSorting: SortingState = mergedColumns
    .filter((c) => c.defaultSortOrder && c.key)
    .map((c) => {
      return {
        id: c.key!,
        desc: c.defaultSortOrder === "ascend" ? false : true,
      };
    });
  const [sortingState, setSortingState] = useMergedState(collectedSorting, {
    onChange: (value) => {
      //   if (!onSorterChange) return;
      // Map sorting state to Ant Design's SorterResult format
      const sortStates: SortState<RecordType>[] = [];
      const sorterResults: SorterResult<RecordType>[] = [];
      for (const [_index, sort] of value.entries()) {
        const column = mergedColumns.find((col) => col.key === sort.id);
        if (!column) continue;
        const order = sort.desc ? "descend" : "ascend";
        const sorterResult: SorterResult<RecordType> = {
          column,
          columnKey: column.key as Key,
          field: (column as ColumnType<RecordType>).dataIndex as Key,
          order,
          //   multiplePriority:
          //     typeof column.sorter === "object"
          //       ? column.sorter.multiple
          //       : undefined,
        };
        sortStates.push({
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
      // Call onSorterChange with the appropriate format
      if (sorterResults.length <= 1) {
        onSorterChange(sorterResults[0]!, sortStates);
      } else {
        onSorterChange(sorterResults, sortStates);
      }
      setSortStates(sortStates);
    },
    // postState: (value) => {
    //   // Sort by priority similar to antd
    //   if (!value) return value;
    //   return [...value].sort((a, b) => {
    //     const columnA = mergedColumns.find((col) => col.key === a.id);
    //     const columnB = mergedColumns.find((col) => col.key === b.id);
    //     const priorityA =
    //       typeof columnA?.sorter === "object" ? columnA.sorter.multiple : 0;
    //     const priorityB =
    //       typeof columnB?.sorter === "object" ? columnB.sorter.multiple : 0;
    //     return priorityB - priorityA; // Higher priority comes first
    //   });
    // },
  });

  const getColumnKeys = (
    columns: ColumnsType<RecordType>,
    pos?: string,
  ): Key[] => {
    const newKeys: Key[] = [];
    columns.forEach((item, index) => {
      const columnPos = getColumnPos(index, pos);
      newKeys.push(getColumnKey<RecordType>(item, columnPos));
      if (Array.isArray((item as ColumnGroupType<RecordType>).children)) {
        const childKeys = getColumnKeys(
          (item as ColumnGroupType<RecordType>).children,
          columnPos,
        );
        newKeys.push(...childKeys);
      }
    });
    return newKeys;
  };
  const mergedSorterStates = React.useMemo<SortState<RecordType>[]>(() => {
    let validate = true;
    const collectedStates = collectSortStates<RecordType>(mergedColumns, false);

    // Return if not controlled
    if (!collectedStates.length) {
      const mergedColumnsKeys = getColumnKeys(mergedColumns);
      return sortStates.filter(({ key }) => mergedColumnsKeys.includes(key));
    }

    const validateStates: SortState<RecordType>[] = [];

    function patchStates(state: SortState<RecordType>) {
      if (validate) {
        validateStates.push(state);
      } else {
        validateStates.push({
          ...state,
          sortOrder: null,
        });
      }
    }

    let multipleMode: boolean | null = null;
    collectedStates.forEach((state) => {
      if (multipleMode === null) {
        patchStates(state);

        if (state.sortOrder) {
          if (state.multiplePriority === false) {
            validate = false;
          } else {
            multipleMode = true;
          }
        }
      } else if (multipleMode && state.multiplePriority !== false) {
        patchStates(state);
      } else {
        validate = false;
        patchStates(state);
      }
    });

    return validateStates;
  }, [mergedColumns, sortStates]);

  // Get render columns title required props
  const columnTitleSorterProps = React.useMemo<
    ColumnTitleProps<RecordType>
  >(() => {
    const sortColumns = mergedSorterStates.map(({ column, sortOrder }) => ({
      column,
      order: sortOrder,
    }));

    return {
      sortColumns,
      // Legacy
      sortColumn: sortColumns[0]?.column,
      sortOrder: sortColumns[0]?.order,
    };
  }, [mergedSorterStates]);

  const triggerSorter = (sortState: SortState<RecordType>) => {
    let newSorterStates: SortState<RecordType>[];
    if (
      sortState.multiplePriority === false ||
      !mergedSorterStates.length ||
      mergedSorterStates[0]?.multiplePriority === false
    ) {
      newSorterStates = [sortState];
    } else {
      newSorterStates = [
        ...mergedSorterStates.filter(({ key }) => key !== sortState.key),
        sortState,
      ];
    }
    setSortStates(newSorterStates);
    onSorterChange(generateSorterInfo(newSorterStates), newSorterStates);
  };

  const transformColumns = (innerColumns: ColumnsType<RecordType>) =>
    injectSorter(
      innerColumns,
      mergedSorterStates,
      triggerSorter,
      sortDirections,
      tableLocale,
      showSorterTooltip,
    );

  const getSorters = () => generateSorterInfo(mergedSorterStates);

  // const handleSortingChange: OnChangeFn<SortingState> = React.useCallback(
  //   (updaterOrValue) => {
  //     const newSorting =
  //       typeof updaterOrValue === "function"
  //         ? updaterOrValue(collectedSorting)
  //         : updaterOrValue;
  //     setSorting(newSorting);
  //   },
  //   [collectedSorting, setSorting],
  // );

  return [
    sortingState,
    setSortingState,
    transformColumns,
    mergedSorterStates,
    columnTitleSorterProps,
    getSorters,
  ];
};

export default useFilterSorter;

"use client";

import type {
  ExpandedState,
  OnChangeFn,
  Row,
  Table as TableDef,
} from "@tanstack/react-table";
import React, { Fragment, useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useScroll, useSize } from "ahooks";
import _ from "lodash";

import type { AnyObject } from "../_util/type";
import type { ConfigConsumerProps } from "../config-provider/context";
import type { SizeType } from "../config-provider/size-context";
import type { FilterState } from "./hooks/use-filter";
import type { SortState } from "./hooks/use-sorter";
import type {
  ColumnsType,
  ExpandableConfig,
  FilterValue,
  GetComponentProps,
  GetPopupContainer,
  GetRowKey,
  Key,
  LegacyExpandableProps,
  RcTableProps,
  RowSelectMethod,
  SorterResult,
  SorterTooltipProps,
  SortOrder,
  TableAction,
  TableComponents,
  TableCurrentDataSource,
  TableLocale,
  TablePaginationConfig,
  TableRowSelection,
} from "./types";
import scrollTo from "../_util/scroll-to";
import { devUseWarning } from "../_util/warning";
import { cn } from "../../lib/utils";
import { Checkbox } from "../checkbox";
import { ConfigContext, useComponentConfig } from "../config-provider/context";
import defaultLocale from "../locale/en-us";
import { Pagination } from "../pagination";
import { Skeleton } from "../skeleton";
import { Spin } from "../spin";
import {
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRoot,
  TableRow,
  TableWrapperFooter,
  TableWrapperHeader,
} from "./_components/base";
import { ColGroup } from "./_components/col-group";
import { TableHeadAdvanced } from "./_components/table-head-advanced";
import { useColumns } from "./hooks/use-columns";
import useExpand from "./hooks/use-expand";
import { getFilterData } from "./hooks/use-filter";
import useLazyKVMap from "./hooks/use-lazy-kv-map";
import usePagination, { getPaginationParam } from "./hooks/use-pagination";
import useSorter from "./hooks/use-sorter";
import { TableStoreProvider } from "./hooks/use-table";
import { getCommonPinningClassName, getCommonPinningStyles } from "./styles";

const EMPTY_LIST: AnyObject[] = [];

function normalizeSelectionKeys(keys?: readonly Key[]) {
  return (keys ?? []).map(String);
}

function flattenSelectionData<RecordType extends AnyObject = AnyObject>(
  data: readonly RecordType[],
  childrenColumnName: string,
): RecordType[] {
  let list: RecordType[] = [];

  for (const record of data) {
    list.push(record);

    if (
      record &&
      typeof record === "object" &&
      childrenColumnName in record &&
      Array.isArray(record[childrenColumnName])
    ) {
      list = [
        ...list,
        ...flattenSelectionData(
          record[childrenColumnName] as readonly RecordType[],
          childrenColumnName,
        ),
      ];
    }
  }

  return list;
}

function SelectionControl({
  type,
  checked,
  indeterminate = false,
  disabled = false,
  ariaLabel,
  className,
  onClick,
  onToggle,
}: {
  type: "checkbox" | "radio";
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onToggle: () => void;
}) {
  if (type === "radio") {
    return (
      <span className="flex w-full items-center justify-center leading-none">
        <button
          type="button"
          role="radio"
          aria-checked={checked}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            "border-input bg-background text-primary inline-flex size-4 shrink-0 items-center justify-center rounded-full border align-middle outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "border-primary bg-primary text-primary-foreground" : undefined,
            className,
          )}
          onClick={(event) => {
            event.stopPropagation();
            onClick?.(event);
            onToggle();
          }}
        >
          <span
            className={cn(
              "size-2 rounded-full bg-transparent",
              checked && "bg-current",
            )}
          />
        </button>
      </span>
    );
  }

  return (
    <span className="flex w-full items-center justify-center leading-none">
      <Checkbox
        aria-label={ariaLabel}
        checked={indeterminate ? "indeterminate" : checked}
        disabled={disabled}
        className={cn("align-middle", className)}
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          event.stopPropagation();
          onClick?.(event);
        }}
        onCheckedChange={() => {
          if (disabled) {
            return;
          }

          onToggle();
        }}
      />
    </span>
  );
}

interface ChangeEventInfo<RecordType = AnyObject> {
  pagination: {
    current?: number;
    pageSize?: number;
    total?: number;
  };
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<RecordType> | SorterResult<RecordType>[];

  filterStates: FilterState<RecordType>[];
  sorterStates: SortState<RecordType>[];

  resetPagination: (current?: number, pageSize?: number) => void;
}

type RecordWithCustomRow<TRecord extends AnyObject = AnyObject> =
  | (Omit<TRecord, "_customRow" | "_customRowClassName"> & {
      _customRow?: undefined;
      _customRowClassName?: undefined;
    })
  | (Partial<TRecord> & {
      _customRow: React.ReactNode;
      _customRowClassName?: string;
      _customCellClassName?: string;
      _customRowStyle?: React.CSSProperties;
    });
type TableProps<TRecord extends RecordWithCustomRow = AnyObject> = Omit<
  React.ComponentProps<"table">,
  "title" | "onChange" | "summary"
> &
  Omit<LegacyExpandableProps<TRecord>, "showExpandColumn"> & {
    columns?: ColumnsType<TRecord>;
    dataSource?: TRecord[] | undefined;

    extra?: React.ReactNode;
    alertRender?:
      | React.ReactNode
      | ((args?: {
          selectedRowKeys: Key[];
          selectedRows: TRecord[];
        }) => React.ReactNode);

    bordered?: boolean | "around";
    classNames?: {
      table?: string;
      body?: string;
      header?: string;
      footer?: string;
      row?: string | ((record: TRecord, index: number) => string);
      head?: string;
      cell?: string;
      empty?: string;
    };

    sortDirections?: SortOrder[];
    showSorterTooltip?: boolean | SorterTooltipProps;

    // emptyRender?: EmptyProps;
    /** Config expand rows */
    expandable?: ExpandableConfig<TRecord>;
    indentSize?: number;

    //  {
    //   expandedRowKeys?: string[];
    //   expandedRowRender?: (record: TRecord) => React.ReactNode;
    //   rowExpandable?: (record: TRecord) => boolean;
    //   onExpand?: (expanded: boolean, record: TRecord) => void;
    //   expandRowByClick?: boolean;
    //   columnWidth?: number;
    // };

    /** Row's className */
    rowClassName?: string | ((record: TRecord, index: number) => string);
    /** Row key config */
    rowKey?: (string & {}) | keyof TRecord | GetRowKey<TRecord>;
    /** Row selection config */
    rowSelection?: TableRowSelection<TRecord>;

    pagination?: false | TablePaginationConfig;
    loading?: boolean;
    skeleton?: boolean;
    /** Set sticky header and scroll bar */
    sticky?:
      | boolean
      | {
          offsetHeader?: number;
          offsetScroll?: number;
          getContainer?: () => HTMLElement;
        };
    size?: SizeType;
    /** Whether the table can be scrollable */
    scroll?: {
      x?: number;
      y?: number;
      scrollToFirstRowOnChange?: boolean;
    };
    /** Translation */
    locale?: TableLocale;
    /** Override default table elements */
    components?: TableComponents<TRecord>;

    getPopupContainer?: GetPopupContainer;

    /** Toolbar */
    toolbar?: (table: TableDef<TRecord>) => React.JSX.Element;
    /** Summary content */
    summary?: (currentData: TRecord[]) => React.ReactNode;
    /** Footer content */
    footer?: (currentData: TRecord[]) => React.ReactNode;

    onChange?: (
      pagination: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<TRecord>[],
      extra: TableCurrentDataSource<TRecord>,
    ) => void;

    onRow?: GetComponentProps<TRecord>;

    // Customize
    showHeader?: boolean;

    // =================================== Internal ===================================
    /**
     * @private Internal usage, may remove by refactor. Should always use `columns` instead.
     *
     * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
     */
    internalHooks?: string;
  };

const OwnTable = <TRecord extends AnyObject>(props: TableProps<TRecord>) => {
  const tableConfig = useComponentConfig("table");
  const {
    ref,
    style,
    className,
    classNames,
    bordered: borderedProp = tableConfig.bordered,
    size,

    loading = false,
    skeleton = false,

    columns: _columns,
    children: _children,
    childrenColumnName: _legacyChildrenColumnName,
    dataSource,
    pagination,

    rowClassName,
    rowKey = "key",
    rowSelection,

    sticky,
    scroll,
    locale,

    // Additional Part
    title,
    summary,
    toolbar,
    extra,
    alertRender,
    footer,

    // Customize
    showHeader,
    components,

    onChange,
    onRow,

    sortDirections,
    showSorterTooltip,

    expandable: _expandable,
    expandIcon: _expandIcon,
    expandedRowRender: _expandedRowRender,
    expandIconColumnIndex: _expandIconColumnIndex,
    indentSize: _indentSize,

    // getPopupContainer,

    // Internal
    //  internalHooks,

    ...restProps
  } = props;

  const warning = devUseWarning("Table");

  if (process.env.NODE_ENV !== "production") {
    warning(
      !(typeof rowKey === "function" && rowKey.length > 1),
      "usage",
      "`index` parameter of `rowKey` function is deprecated. There is no guarantee that it will work as expected.",
    );
  }

  const { locale: contextLocale = defaultLocale } =
    React.useContext<ConfigConsumerProps>(ConfigContext);

  // const mergedData = dataSource ?? EMPTY_DATA;
  const rawData: readonly TRecord[] = dataSource ?? EMPTY_LIST;

  const tableLocale: TableLocale = { ...contextLocale.Table, ...locale };

  // =======================
  const internalRefs: NonNullable<RcTableProps["internalRefs"]> = {
    body: React.useRef<HTMLDivElement>(null),
  } as NonNullable<RcTableProps["internalRefs"]>;

  // const data = React.useMemo(() => dataSource, [dataSource]);

  // ==================== Customize =====================
  // const getComponent = React.useCallback<GetComponent>(
  //   (path, defaultComponent) => getValue(components, path) || defaultComponent,
  //   [components],
  // );

  // ============================ RowKey ============================
  const getRowKey = React.useMemo<GetRowKey<TRecord>>(() => {
    if (typeof rowKey === "function") {
      return rowKey;
    }
    return (record: TRecord, index: number) => {
      const key = record[rowKey];

      return key ?? index;
    };
  }, [rowKey]);

  // ============================ Events =============================
  const changeEventInfo: Partial<ChangeEventInfo<TRecord>> = {};

  const triggerOnChange = (
    info: Partial<ChangeEventInfo<TRecord>>,
    action: TableAction,
    reset = false,
  ) => {
    const changeInfo = {
      ...changeEventInfo,
      ...info,
    };

    if (reset) {
      changeEventInfo.resetPagination?.();

      // Reset event param
      if (changeInfo.pagination?.current) {
        changeInfo.pagination.current = 1;
      }

      // Trigger pagination events
      const changedPageSize = changeInfo.pagination?.pageSize;
      if (pagination && changedPageSize !== undefined) {
        pagination.onChange?.(1, changedPageSize);
      }
    }

    if (
      scroll &&
      scroll.scrollToFirstRowOnChange !== false &&
      internalRefs.body.current
    ) {
      scrollTo(0, {
        getContainer: () => internalRefs.body.current,
      });
    }

    const paginationInfo = changeInfo.pagination ?? {};
    const filterInfo = changeInfo.filters ?? {};
    const sorterInfo = Array.isArray(changeInfo.sorter)
      ? changeInfo.sorter
      : changeInfo.sorter
        ? [changeInfo.sorter]
        : [];

    onChange?.(paginationInfo, filterInfo, sorterInfo, {
      // currentDataSource: getFilterData(
      //   getSortData(rawData, changeInfo.sorterStates!, childrenColumnName),
      //   changeInfo.filterStates!,
      //   childrenColumnName,
      // ),
      currentDataSource: [],
      action,
    });
  };

  // ========================== Expandable ==========================
  const [
    expandedState,
    setExpandedState,

    expandableConfig,
    expandType,
    mergedExpandedKeys,
    mergedExpandIcon,
    childrenColumnName,
    onTriggerExpand,
  ] = useExpand(
    // {
    //   ...props,
    //   expandable: {
    //     ...props.expandable,
    //     expandedRowKeys:
    //       typeof expanded === "boolean"
    //         ? findAllChildrenKeys<TRecord>(
    //             rawData,
    //             getRowKey,
    //             props.expandable?.childrenColumnName ?? "children",
    //           )
    //         : expandedStateToExpandedRowKeys(expanded),
    //   },
    // },
    props,
    rawData,
    getRowKey,
  );

  const [getRecordByKey] = useLazyKVMap(rawData, childrenColumnName, getRowKey);

  // useEffect(() => {
  //   const expandedRowKeys = expandable?.expandedRowKeys ?? [];
  //   setExpanded((prev) => {
  //     if (typeof prev === "boolean") return prev;
  //     const newExpanded = { ...prev };
  //     for (const key of expandedRowKeys) {
  //       newExpanded[key.toString()] = true;
  //     }
  //     return newExpanded;
  //   });
  // }, [expandable?.expandedRowKeys]);
  // const [expanded, setExpanded] = useMergedState<ExpandedState>(
  //   {},
  //   {
  //     value: expandable?.expandedRowKeys
  //       ? expandable.expandedRowKeys.reduce((acc, key) => {
  //           acc[key.toString()] = true;
  //           return acc;
  //         }, {} as ExpandedStateList)
  //       : undefined,
  //     onChange: () => {
  //       // if (typeof value === "boolean") return;
  //       // const expandedRowKeys = Object.keys(value).filter((key) => value[key]);
  //       // expandable?.onExpand?.(expandedRowKeys, {});
  //     },
  //   },
  // );

  /**
   * Controlled state in `columns` is not a good idea that makes too many code (1000+ line?) to read
   * state out and then put it back to title render. Move these code into `hooks` but still too
   * complex. We should provides Table props like `sorter` & `filter` to handle control in next big
   * version.
   */

  // ============================ Filter/Sort Data ============================
  // const sortedData = React.useMemo(
  //   () => getSortData(rawData, sortStates, childrenColumnName),
  //   [rawData, sortStates],
  // );
  const sortedData = React.useMemo(() => [...rawData], [rawData]);

  const mergedData = React.useMemo(
    () =>
      getFilterData(
        sortedData,
        [], // filterStates,
        childrenColumnName,
      ),
    [sortedData, childrenColumnName],
  );

  // ====================== Column ======================
  const flattenedSelectionData = React.useMemo(
    () => flattenSelectionData(mergedData, childrenColumnName),
    [mergedData, childrenColumnName],
  );

  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = React.useState<
    string[]
  >(() => normalizeSelectionKeys(rowSelection?.defaultSelectedRowKeys));

  const controlledSelectedRowKeys = React.useMemo(
    () => normalizeSelectionKeys(rowSelection?.selectedRowKeys),
    [rowSelection?.selectedRowKeys],
  );

  const selectedRowKeys =
    rowSelection?.selectedRowKeys === undefined
      ? internalSelectedRowKeys
      : controlledSelectedRowKeys;
  const selectedKeySet = React.useMemo(
    () => new Set(selectedRowKeys),
    [selectedRowKeys],
  );

  const selectionType = rowSelection?.type ?? "checkbox";
  const recordKeyBySelectionKey = React.useMemo(
    () =>
      new Map(
        flattenedSelectionData.map((record, index) => {
          const recordKey = getRowKey(record, index);
          return [String(recordKey), recordKey] as const;
        }),
      ),
    [flattenedSelectionData, getRowKey],
  );
  const selectedRows = React.useMemo(
    () =>
      selectedRowKeys
        .map((key) => getRecordByKey(key))
        .filter((record): record is TRecord => record !== undefined),
    [getRecordByKey, selectedRowKeys],
  );

  const setSelectedRows = React.useCallback(
    (nextKeys: string[], method: RowSelectMethod) => {
      if (rowSelection?.selectedRowKeys === undefined) {
        setInternalSelectedRowKeys(nextKeys);
      }

      const nextRows = nextKeys
        .map((key) => getRecordByKey(key))
        .filter((record): record is TRecord => record !== undefined);
      const nextRecordKeys = nextKeys.map(
        (key) => recordKeyBySelectionKey.get(key) ?? key,
      );

      rowSelection?.onChange?.(nextRecordKeys, nextRows, { type: method });
    },
    [getRecordByKey, recordKeyBySelectionKey, rowSelection],
  );

  const transformSelectionColumns = React.useCallback(
    (columns: ColumnsType<TRecord>) => {
      if (!rowSelection) {
        return columns;
      }

      const selectionColumnWidth = rowSelection.columnWidth ?? 48;
      const visibleSelectionKeys = flattenedSelectionData
        .map((record, index) => ({
          key: String(getRowKey(record, index)),
          record,
          disabled: rowSelection.getCheckboxProps?.(record)?.disabled ?? false,
        }))
        .filter((item) => !item.disabled);

      const allChecked =
        visibleSelectionKeys.length > 0 &&
        visibleSelectionKeys.every((item) => selectedKeySet.has(item.key));
      const someChecked = visibleSelectionKeys.some((item) =>
        selectedKeySet.has(item.key),
      );

      const toggleAll = () => {
        const nextKeys = allChecked
          ? selectedRowKeys.filter(
              (key) => !visibleSelectionKeys.some((item) => item.key === key),
            )
          : [
              ...new Set([
                ...selectedRowKeys,
                ...visibleSelectionKeys.map((item) => item.key),
              ]),
            ];

        setSelectedRows(nextKeys, "all");
      };

      const selectionColumn = {
        key: "__select__",
        width: selectionColumnWidth,
        minWidth:
          typeof selectionColumnWidth === "number" ? selectionColumnWidth : 48,
        title:
          selectionType === "radio"
            ? null
            : rowSelection.columnTitle
              ? typeof rowSelection.columnTitle === "function"
                ? rowSelection.columnTitle(
                    <SelectionControl
                      type="checkbox"
                      ariaLabel="Select all"
                      checked={allChecked}
                      indeterminate={!allChecked && someChecked}
                      disabled={visibleSelectionKeys.length === 0}
                      onToggle={toggleAll}
                    />,
                  )
                : rowSelection.columnTitle
              : !rowSelection.hideSelectAll && (
                  <SelectionControl
                    type="checkbox"
                    ariaLabel="Select all"
                    checked={allChecked}
                    indeterminate={!allChecked && someChecked}
                    disabled={visibleSelectionKeys.length === 0}
                    onToggle={toggleAll}
                  />
                ),
        render: (_: unknown, record: TRecord, index: number) => {
          const key = String(getRowKey(record, index));
          const checkboxProps = rowSelection.getCheckboxProps?.(record);
          const checked = selectedKeySet.has(key);
          const originNode = (
            <SelectionControl
              type={selectionType}
              ariaLabel="Select row"
              checked={checked}
              disabled={checkboxProps?.disabled ?? false}
              className={checkboxProps?.className}
              onClick={(event) => {
                checkboxProps?.onClick?.(event);
              }}
              onToggle={() => {
                if (checkboxProps?.disabled) {
                  return;
                }

                const nextKeys =
                  selectionType === "radio"
                    ? [key]
                    : checked
                      ? selectedRowKeys.filter(
                          (selectedKey) => selectedKey !== key,
                        )
                      : [...selectedRowKeys, key];

                const method: RowSelectMethod =
                  selectionType === "radio" ? "single" : "all";
                setSelectedRows([...new Set(nextKeys)], method);
              }}
            />
          );

          return rowSelection.renderCell
            ? rowSelection.renderCell(checked, record, index, originNode)
            : originNode;
        },
        align: rowSelection.align ?? "center",
        onCell: rowSelection.onCell,
      } satisfies ColumnsType<TRecord>[0];

      return [selectionColumn, ...columns];
    },
    [
      flattenedSelectionData,
      getRowKey,
      rowSelection,
      selectedKeySet,
      selectedRowKeys,
      selectionType,
      setSelectedRows,
    ],
  );

  const [mergedColumns, columnsForTTTable, _flattenColumns] =
    useColumns<TRecord>(
      {
        ...props,
        ...expandableConfig,
        expandable: !!expandableConfig.expandedRowRender,
        expandColumnTitle: expandableConfig.columnTitle,
        expandedKeys: mergedExpandedKeys,
        getRowKey,
        onTriggerExpand,
        expandIcon: mergedExpandIcon,
        expandIconColumnIndex: expandableConfig.expandIconColumnIndex,
        expandedRowRender: expandableConfig.expandedRowRender,
      },
      transformSelectionColumns,
    );

  // ============================ Sorter =============================
  const onSorterChange = (
    sorter: SorterResult<TRecord> | SorterResult<TRecord>[],
    sorterStates: SortState<TRecord>[],
  ) => {
    triggerOnChange(
      {
        sorter,
        sorterStates,
      },
      "sort",
      false,
    );
  };

  const [
    sortingState,
    setSortingState,
    _transformSorterColumns,
    sortStates,
    _sorterTitleProps,
    getSorters,
  ] = useSorter<TRecord>({
    mergedColumns,
    onSorterChange,
    sortDirections: sortDirections ?? ["ascend", "descend"],
    tableLocale,
    showSorterTooltip,
  });

  changeEventInfo.sorter = getSorters();
  changeEventInfo.sorterStates = sortStates;

  // ====================== Pinnings ======================

  // ========================== Pagination ==========================
  const onPaginationChange = (current: number, pageSize: number) => {
    triggerOnChange(
      {
        pagination: { ...changeEventInfo.pagination, current, pageSize },
      },
      "paginate",
    );
  };

  const [mergedPagination, resetPagination] = usePagination(
    rawData.length,
    onPaginationChange,
    pagination,
  );

  changeEventInfo.pagination =
    pagination === false
      ? {}
      : getPaginationParam(mergedPagination, pagination);

  changeEventInfo.resetPagination = resetPagination;

  // ============================= Data =============================
  // const pageData = React.useMemo<TRecord[]>(() => {
  //   if (pagination === false || !mergedPagination.pageSize) {
  //     return mergedData;
  //   }

  //   const {
  //     current = 1,
  //     total,
  //     pageSize = DEFAULT_PAGE_SIZE,
  //   } = mergedPagination;
  //   warning(current > 0, "usage", "`current` should be positive number.");

  //   // Dynamic table data
  //   if (mergedData.length < total!) {
  //     if (mergedData.length > pageSize) {
  //       warning(
  //         false,
  //         "usage",
  //         "`dataSource` length is less than `pagination.total` but large than `pagination.pageSize`. Please make sure your config correct data with async mode.",
  //       );
  //       return mergedData.slice((current - 1) * pageSize, current * pageSize);
  //     }
  //     return mergedData;
  //   }

  //   return mergedData.slice((current - 1) * pageSize, current * pageSize);
  // }, [
  //   !!pagination,
  //   mergedData,
  //   mergedPagination?.current,
  //   mergedPagination?.pageSize,
  //   mergedPagination?.total,
  // ]);

  // ====================== Table Instance ======================
  // Memoize columns to prevent unnecessary re-renders
  // const memoizedColumns = React.useMemo(
  //   () => columnsForTTTable,
  //   [columnsForTTTable],
  // );

  // Memoize table state to prevent unnecessary re-renders
  // const tableState = React.useMemo(
  //   () => ({
  //     // columnPinning,
  //     // expanded,
  //     // rowSelection,
  //     // sorting: collectedSorting,
  //   }),
  //   [columnPinning, expanded, rowSelection, collectedSorting],
  // );

  // Memoize handlers to prevent unnecessary re-renders
  const handleExpandedChange: OnChangeFn<ExpandedState> = React.useCallback(
    (updaterOrValue) => {
      setExpandedState(updaterOrValue);
    },
    [setExpandedState],
  );

  // ============================ Render ============================
  // const transformColumns = React.useCallback(
  //   (innerColumns: ColumnsType<TRecord>): ColumnsType<TRecord> =>
  //     transformTitleColumns(
  //       transformSelectionColumns(
  //         transformFilterColumns(transformSorterColumns(innerColumns)),
  //       ),
  //     ),
  //   [transformSorterColumns, transformFilterColumns, transformSelectionColumns],
  // );

  // Create table instance with memoized values and required properties

  const table = useReactTable({
    data: mergedData,
    columns: columnsForTTTable,
    state: {
      sorting: sortingState,
      expanded: expandedState,
    },
    // Core functionality
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow, index) => getRowKey(originalRow, index).toString(),
    // Expandable rows
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row[childrenColumnName] ?? [],
    // For tree data (nest): only expand if row has children
    // For custom expandedRowRender: always allow expand
    getRowCanExpand: (row) => {
      if (expandableConfig.expandedRowRender) {
        return true; // Allow expanding for custom detail rows
      }
      // For tree data, check if row has children
      const children = row.original[childrenColumnName];
      return Array.isArray(children) && children.length > 0;
    },
    onExpandedChange: handleExpandedChange,
    // Row selection
    enableRowSelection: false,
    enableSubRowSelection: false,
    // Sorting
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSortingState,
    isMultiSortEvent: mergedColumns.some(
      (col) => typeof col.sorter === "object",
    )
      ? () => true
      : undefined, // Enable multi-sort if any column has sorter object
    // Column resizing
    columnResizeMode: "onChange",
    // Enable manual row model if you're handling pagination server-side
    // manualPagination: true,
    // pageCount: dataQuery.data?.totalPages ?? -1,
  });

  // ====================== Scroll ======================
  // const [colsWidths, _updateColsWidths] = useLayoutState(
  //   new Map<React.Key, number>(),
  // );

  // Convert map to number width
  // const colsKeys = getColumnsKey(flattenColumns);
  // const pureColWidths = colsKeys.map((columnKey) => colsWidths.get(columnKey)!);

  // const colWidths = React.useMemo(
  //   () => pureColWidths,
  //   // eslint-disable-next-line react-compiler/react-compiler
  //   [pureColWidths.join("_")],
  // );
  // const stickyOffsets = useStickyOffsets(colWidths, flattenColumns, direction);

  // ---- scroll X ----//
  // ---- to show or disable box-shadow ----//
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wrapperSize = useSize(wrapperRef);
  const wrapperWidth = wrapperSize?.width ?? scroll?.x ?? 0;
  const wrapperScroll = useScroll(wrapperRef);
  const wrapperScrollLeft = wrapperScroll?.left ?? 0;
  const wrapperScrollRight =
    (scroll?.x ?? 0) - (wrapperWidth + wrapperScrollLeft);

  const TableHeaderComp =
    components?.header &&
    "wrapper" in components.header &&
    components.header.wrapper
      ? components.header.wrapper
      : TableHeader;
  const TableBodyComp =
    components?.body && "wrapper" in components.body && components.body.wrapper
      ? components.body.wrapper
      : TableBody;
  const TableRowComp =
    components?.body && "row" in components.body && components.body.row
      ? components.body.row
      : TableRow;

  const TableToolbarSection = toolbar ? <>{toolbar(table)}</> : undefined;
  const TableAlertSection = alertRender ? (
    typeof alertRender === "function" ? (
      alertRender({
        selectedRowKeys,
        selectedRows,
      })
    ) : (
      <div className="mb-4">{alertRender}</div>
    )
  ) : (
    <></>
  );

  // ====================== UI ======================
  const bordered = borderedProp ?? tableConfig?.bordered ?? false;
  // ---- classes ----//
  const getRowClassName = (row: Row<TRecord>, index: number) => {
    const classFromClassNames = classNames?.row
      ? typeof classNames.row === "string"
        ? classNames.row
        : classNames.row(row.original, index)
      : "";

    const classFromRowClassName = rowClassName
      ? typeof rowClassName === "string"
        ? rowClassName
        : rowClassName(row.original, index)
      : "";

    return cn(classFromClassNames, classFromRowClassName);
  };

  // ========================================================================
  // ==                               Render                               ==
  // ========================================================================
  // =================== Render: Node ===================
  // // Header props
  // const headerProps = {
  //   colWidths,
  //   columCount: flattenColumns.length,
  //   // stickyOffsets,
  //   // onHeaderRow,
  //   // fixHeader,
  //   scroll,
  // };

  // Use table.getAllLeafColumns() to include dynamically added columns (selection, etc.)
  const allLeafColumns = table.getAllLeafColumns();

  const bodyColGroup = (
    <ColGroup
      colWidths={allLeafColumns.map((col) => {
        // Only return size if explicitly set (not TanStack Table's default 150)
        const colDef = col.columnDef;
        // Check if size/minSize was explicitly set or if meta has width
        const hasExplicitSize =
          colDef.size !== undefined ||
          colDef.minSize !== undefined ||
          (colDef.meta &&
            typeof colDef.meta === "object" &&
            "width" in colDef.meta);

        return hasExplicitSize ? col.getSize() : undefined;
      })}
      columCount={allLeafColumns.length}
    />
  );

  return (
    <TableStoreProvider>
      <Spin spinning={loading} className={className}>
        <div
          data-slot="table-container"
          className={cn(
            "relative w-full space-y-3",
            bordered && [
              // "border rounded-lg",
              // "[&_table]:border-separate",
              // "[&>table]:border-spacing-0 [&>table]:rounded-md [&>table]:border",
              typeof bordered === "boolean" &&
                "[&_th]:border-e [&_th:last-child]:border-e-0",
              typeof bordered === "boolean" &&
                "[&_td]:border-e [&_td:last-child]:border-e-0",
            ],
            (!bordered || bordered === "around") && [
              "[&_th]:before:bg-accent [&_th]:before:absolute [&_th]:before:top-1/2 [&_th]:before:right-0 [&_th]:before:h-[1.6em] [&_th]:before:w-px [&_th]:before:-translate-y-1/2 [&_th]:before:content-[''] [&_th:last-child]:before:bg-transparent",
            ],
            // bordered === "around" && [
            // "[&_table]:border-separate [&_table]:border-spacing-0 [&_table]:rounded-md",
            // ],
            className,
          )}
          style={style}
        >
          {TableToolbarSection}

          {TableAlertSection}
          <div
            ref={wrapperRef}
            data-slot="table-scroll-container"
            className={cn(
              scroll?.x && "overflow-x-auto overflow-y-hidden",
              scroll?.y && "overflow-y-auto",
              // bordered && "rounded-md border",
            )}
            style={{
              maxHeight: scroll?.y,
            }}
          >
            {(title || extra) && (
              <TableWrapperHeader bordered={bordered} size={size}>
                <div
                  data-slot="table-title"
                  // className="font-semibold tracking-tight"
                >
                  {title?.(mergedData)}
                </div>
                {extra && <div>{extra}</div>}
              </TableWrapperHeader>
            )}
            <TableRoot
              ref={ref}
              className={cn(
                !scroll?.x && "w-full",
                // bordered
                // bordered &&
                //   "border-separate border-spacing-0 rounded-md border-s border-t",
                // size === "small" ? "[&_th]:" : "",
                (title || extra) && "rounded-t-none",
                footer && "rounded-b-none",
                classNames?.table,
              )}
              style={{
                ...(scroll?.x
                  ? {
                      width: scroll.x,
                      tableLayout: "fixed",
                      minWidth: "100%",
                    }
                  : // Set tableLayout="fixed" when we have fixed-width columns (selection, expand)
                    rowSelection || expandType === "nest"
                    ? { tableLayout: "fixed" }
                    : {}),
              }}
              bordered={bordered}
              {...restProps}
            >
              {bodyColGroup}
              {showHeader !== false && (
                <TableHeaderComp
                  style={{
                    // Auto sticky when scroll.y is set
                    position: sticky || scroll?.y ? "sticky" : undefined,
                    top: sticky
                      ? typeof sticky === "boolean"
                        ? 0
                        : sticky.offsetHeader
                      : scroll?.y
                        ? 0
                        : undefined,
                    zIndex: sticky || scroll?.y ? 11 : undefined,
                    backgroundColor:
                      sticky || scroll?.y
                        ? "hsl(var(--background))"
                        : undefined,
                  }}
                  className={classNames?.header}
                >
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent"
                    >
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHeadAdvanced
                            key={header.id}
                            locale={tableLocale}
                            column={header.column}
                            scope="col"
                            colSpan={header.colSpan}
                            size={size}
                            style={getCommonPinningStyles(header.column)}
                            align={
                              header.column.columnDef.meta?.align === "end"
                                ? "right"
                                : header.column.columnDef.meta?.align ===
                                    "start"
                                  ? "left"
                                  : header.column.columnDef.meta?.align ===
                                      "match-parent"
                                    ? undefined
                                    : header.column.columnDef.meta?.align
                            }
                            className={cn(
                              // align
                              header.column.columnDef.meta?.align ===
                                "center" && "text-center",
                              header.column.columnDef.meta?.align === "right" &&
                                "text-right",
                              // pinning
                              // scroll?.x &&
                              getCommonPinningClassName(
                                header.column,
                                {
                                  scrollLeft: wrapperScrollLeft,
                                  scrollRight: wrapperScrollRight,
                                },
                                true,
                              ),
                              // selection column
                              header.id === "__select__" && "px-2",
                              classNames?.head,
                              // column className
                              header.column.columnDef.meta?.className,
                              header.column.columnDef.meta?.classNames?.head,
                            )}
                            {...header.column.columnDef.meta?.headAttributes}
                          >
                            {header.isPlaceholder
                              ? undefined
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHeadAdvanced>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeaderComp>
              )}
              {/* padding with header [disable if bordered]*/}
              {/* {!bordered && <tbody aria-hidden="true" className="h-3"></tbody>} */}
              {skeleton ? (
                <TableBody>
                  {Array.from({ length: mergedPagination?.pageSize ?? 5 })
                    .fill(0)
                    .map((_, index) => {
                      return (
                        <TableRow key={index} className="hover:bg-transparent">
                          {table.getVisibleFlatColumns().map((x) => {
                            return (
                              <TableCell key={x.id}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                </TableBody>
              ) : (
                <TableBodyComp className={classNames?.body}>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row, rowIndex) =>
                      "_customRow" in row.original ? (
                        <TableRow
                          key={row.id}
                          className={cn(
                            getRowClassName(row, rowIndex),
                            row.original._customRowClassName,
                          )}
                          style={
                            row.original._customRowStyle as React.CSSProperties
                          }
                        >
                          <TableCell
                            colSpan={allLeafColumns.length}
                            size={size}
                            className={cn(
                              row.original._customCellClassName as string,
                            )}
                          >
                            {row.original._customRow}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <Fragment key={row.id}>
                          <TableRowComp
                            data-state={
                              selectedKeySet.has(
                                String(getRowKey(row.original, rowIndex)),
                              ) && "selected"
                            }
                            data-row-key={getRowKey(row.original, rowIndex)}
                            className={cn(
                              // row.getIsExpanded() && "bg-gray-50",
                              // row.getIsExpanded() && bordered === false
                              //   ? "border-x"
                              //   : "",
                              getRowClassName(row, rowIndex),
                            )}
                            onClick={(e: React.MouseEvent) => {
                              onRow?.(row.original).onClick?.(e);
                              // onRow?.({
                              //   record: row.original,
                              //   row,
                              //   table,
                              //   event: e,
                              // });

                              if (expandableConfig.expandRowByClick) {
                                const selection = globalThis.getSelection();
                                if (selection?.type === "Range") {
                                  return;
                                }
                                row.getToggleExpandedHandler()();
                                // row.getToggleExpandedHandler()();
                              }
                              // e.preventDefault();
                              // e.stopPropagation();
                            }}
                          >
                            {row.getVisibleCells().map((cell) => {
                              return (
                                <TableCell
                                  key={cell.id}
                                  size={size}
                                  className={cn(
                                    // align
                                    cell.column.columnDef.meta?.align ===
                                      "center" && "text-center",
                                    cell.column.columnDef.meta?.align ===
                                      "right" && "text-right",
                                    // pinning
                                    // scroll?.x &&
                                    getCommonPinningClassName(cell.column, {
                                      scrollLeft: wrapperScrollLeft,
                                      scrollRight: wrapperScrollRight,
                                    }),
                                    // selection column
                                    (cell.column.id === "__select__" ||
                                      cell.id.endsWith("selection")) &&
                                      "px-2",
                                    // column className
                                    classNames?.cell,
                                    cell.column.columnDef.meta?.className,
                                    cell.column.columnDef.meta?.classNames
                                      ?.cell,
                                  )}
                                  style={{
                                    ...getCommonPinningStyles(cell.column),
                                    ...(typeof cell.column.columnDef.meta
                                      ?.styles?.cell === "function"
                                      ? cell.column.columnDef.meta.styles.cell({
                                          record: row.original,
                                          index: row.index,
                                          row,
                                          column: cell.column,
                                        })
                                      : cell.column.columnDef.meta?.styles
                                          ?.cell),
                                  }}
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRowComp>
                          {row.getIsExpanded() &&
                            expandableConfig.expandedRowRender && (
                              <TableRow className="bg-gray-50 hover:bg-gray-50">
                                {/* 2nd row is a custom 1 cell row */}
                                <TableCell
                                  colSpan={row.getVisibleCells().length}
                                  size={size}
                                  className={cn(
                                    // "px-4 text-[13px]",
                                    bordered === false ? "border-b" : "",
                                  )}
                                >
                                  {expandableConfig.expandedRowRender(
                                    row.original,
                                    row.index,
                                    row.index,
                                    row.getIsExpanded(),
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                        </Fragment>
                      ),
                    )
                  ) : (
                    <TableRow
                      className={cn("hover:bg-transparent", classNames?.empty)}
                    >
                      <TableCell
                        colSpan={allLeafColumns.length}
                        className={cn(
                          "text-muted-foreground h-48 text-center",
                          bordered && "border-e",
                        )}
                      >
                        {!loading &&
                          (typeof tableLocale.emptyText === "function"
                            ? tableLocale.emptyText()
                            : tableLocale.emptyText)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBodyComp>
              )}
              {summary && (
                <TableFooter className={classNames?.footer}>
                  {summary(mergedData)}
                </TableFooter>
              )}
            </TableRoot>
            {footer && (
              <TableWrapperFooter bordered={bordered} size={size}>
                {footer(mergedData)}
              </TableWrapperFooter>
            )}
          </div>
          {pagination && (
            <Pagination
              className="my-4 justify-end"
              {...pagination}
              total={pagination.total ?? dataSource?.length}
            />
          )}
        </div>
      </Spin>
    </TableStoreProvider>
  );
};
export { OwnTable };

export type { TableProps as OwnTableProps, RecordWithCustomRow };

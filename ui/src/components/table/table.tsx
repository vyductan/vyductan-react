/* eslint-disable react-hooks/react-compiler */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-unsafe-return */
"use client";

import type {
  ColumnDef,
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

import { cn } from "@acme/ui/lib/utils";
import { Skeleton } from "@acme/ui/shadcn/skeleton";

import type { AnyObject } from "../_util/type";
import type { ConfigConsumerProps } from "../config-provider/context";
import type { SizeType } from "../config-provider/size-context";
import type { FilterState } from "./hooks/use-filter";
import type { SortState } from "./hooks/use-sorter";
import type {
  ColumnsType,
  ExpandableConfig,
  ExpandType,
  FilterValue,
  GetComponentProps,
  GetPopupContainer,
  GetRowKey,
  Key,
  LegacyExpandableProps,
  RcTableProps,
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
import { Checkbox } from "../checkbox";
import { ConfigContext } from "../config-provider/context";
import defaultLocale from "../locale/en-us";
import { Pagination } from "../pagination";
import { Spin } from "../spin";
import {
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRoot,
  TableRow,
} from "./_components";
import { ColGroup } from "./_components/col-group";
import renderExpandIcon from "./_components/expand-icon";
import { TableHeadAdvanced } from "./_components/table-head-advanced";
import { convertChildrenToColumns, useColumns } from "./hooks/use-columns";
import useExpand from "./hooks/use-expand";
import { getFilterData } from "./hooks/use-filter";
import useLazyKVMap from "./hooks/use-lazy-kv-map";
import usePagination, { getPaginationParam } from "./hooks/use-pagination";
import useSorter from "./hooks/use-sorter";
import { TableStoreProvider } from "./hooks/use-table";
import { getCommonPinningClassName, getCommonPinningStyles } from "./styles";

const EMPTY_LIST: AnyObject[] = [];

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
  | (TRecord & {
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
    rowKey?: string | keyof TRecord | GetRowKey<TRecord>;
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
      x: number;
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
  const {
    ref,
    style,
    className,
    classNames,
    bordered: borderedProp,
    size,

    loading = false,
    skeleton = false,

    columns,
    children,
    childrenColumnName: legacyChildrenColumnName,
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

    // Customize
    showHeader,
    components,

    onChange,
    onRow,

    sortDirections,
    showSorterTooltip,

    expandable,
    expandIcon,
    expandedRowRender,
    expandIconColumnIndex,
    indentSize,

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

  const {
    locale: contextLocale = defaultLocale,
    // direction,
    table: tableConfig,
    // renderEmpty,
    // getPopupContainer: getContextPopupContainer,
  } = React.useContext<ConfigConsumerProps>(ConfigContext);

  // const mergedData = dataSource ?? EMPTY_DATA;
  const rawData: readonly TRecord[] = dataSource ?? EMPTY_LIST;

  const tableLocale: TableLocale = { ...contextLocale.Table, ...locale };

  const mergedExpandable: ExpandableConfig<TRecord> = {
    childrenColumnName: legacyChildrenColumnName,
    expandIconColumnIndex,
    ...expandable,
    expandIcon: expandable?.expandIcon ?? tableConfig?.expandable?.expandIcon,
  };
  const { childrenColumnName = "children" } = mergedExpandable;
  const expandType = React.useMemo<ExpandType>(() => {
    if (rawData.some((item) => item?.[childrenColumnName])) {
      return "nest";
    }

    if (expandedRowRender || expandable?.expandedRowRender) {
      return "row";
    }

    return null;
  }, [rawData]);

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

  const [getRecordByKey] = useLazyKVMap(rawData, childrenColumnName, getRowKey);

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
      if (pagination) {
        pagination.onChange?.(1, changeInfo.pagination?.pageSize!);
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

    onChange?.(
      changeInfo.pagination!,
      changeInfo.filters!,
      Array.isArray(changeInfo.sorter)
        ? changeInfo.sorter
        : changeInfo.sorter
          ? [changeInfo.sorter]
          : [],
      {
        // currentDataSource: getFilterData(
        //   getSortData(rawData, changeInfo.sorterStates!, childrenColumnName),
        //   changeInfo.filterStates!,
        //   childrenColumnName,
        // ),
        currentDataSource: [],
        action,
      },
    );
  };

  // ========================== Expandable ==========================
  // Pass origin render status into `rc-table`, this can be removed when refactor with `rc-table`
  (mergedExpandable as any).__PARENT_RENDER_ICON__ =
    mergedExpandable.expandIcon;

  // Customize expandable icon
  mergedExpandable.expandIcon =
    mergedExpandable.expandIcon || expandIcon || renderExpandIcon(tableLocale!);

  // Adjust expand icon index, no overwrite expandIconColumnIndex if set.
  if (
    expandType === "nest" &&
    mergedExpandable.expandIconColumnIndex === undefined
  ) {
    mergedExpandable.expandIconColumnIndex = rowSelection ? 1 : 0;
  } else if (mergedExpandable.expandIconColumnIndex! > 0 && rowSelection) {
    mergedExpandable.expandIconColumnIndex! -= 1;
  }

  // Indent size
  if (typeof mergedExpandable.indentSize !== "number") {
    mergedExpandable.indentSize =
      typeof indentSize === "number" ? indentSize : 15;
  }

  const [
    expandedState,
    setExpandedState,

    expandableConfig,
    _expandableType,
    mergedExpandedKeys,
    mergedExpandIcon,
    _mergedChildrenColumnName,
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

  const baseColumns = React.useMemo(
    () =>
      columns || (convertChildrenToColumns(children) as ColumnsType<TRecord>),
    [columns, children],
  );

  /**
   * Controlled state in `columns` is not a good idea that makes too many code (1000+ line?) to read
   * state out and then put it back to title render. Move these code into `hooks` but still too
   * complex. We should provides Table props like `sorter` & `filter` to handle control in next big
   * version.
   */

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
    mergedColumns: baseColumns,
    onSorterChange,
    sortDirections: sortDirections ?? ["ascend", "descend"],
    tableLocale,
    showSorterTooltip,
  });
  // const sortedData = React.useMemo(
  //   () => getSortData(rawData, sortStates, childrenColumnName),
  //   [rawData, sortStates],
  // );
  const sortedData = React.useMemo(() => [...rawData], [rawData]);

  changeEventInfo.sorter = getSorters();
  changeEventInfo.sorterStates = sortStates;

  // ============================ Filter ============================
  // const onFilterChange: FilterConfig<TRecord>["onFilterChange"] = (
  //   filters,
  //   filterStates,
  // ) => {
  //   triggerOnChange({ filters, filterStates }, "filter", true);
  // };

  // const [transformFilterColumns, _filterStates, filters] = useFilter<TRecord>({
  //   locale: tableLocale,
  //   mergedColumns: baseColumns,
  //   onFilterChange,
  //   getPopupContainer: getPopupContainer || getContextPopupContainer,
  // });

  const mergedData = getFilterData(
    sortedData,
    [], //filterStates,
    childrenColumnName,
  );

  // const columnTitleProps = React.useMemo<ColumnTitleProps<TRecord>>(() => {
  //   const mergedFilters: Record<string, FilterValue> = {};
  //   for (const filterKey of Object.keys(filters)) {
  //     if (filters[filterKey] !== null) {
  //       mergedFilters[filterKey] = filters[filterKey]!;
  //     }
  //   }
  //   return {
  //     ...sorterTitleProps,
  //     filters: mergedFilters,
  //   };
  // }, [sorterTitleProps, filters]);
  // const [transformTitleColumns] = useTitleColumns(columnTitleProps);

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

  // ========================== Selections ==========================
  // const [
  //   rowSelectionState,
  //   setRowSelection,
  //   transformSelectionColumns,
  //   // selectedKeySet,
  // ] = useSelection<TRecord>(
  //   {
  //     data: mergedData,
  //     pageData,
  //     getRowKey,
  //     getRecordByKey,
  //     expandType,
  //     childrenColumnName,
  //     locale: tableLocale,
  //     getPopupContainer: getPopupContainer || getContextPopupContainer,
  //   },
  //   rowSelection,
  // );

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>(
    rowSelection?.selectedRowKeys || [],
  );
  // const selectedRowKeys = Object.keys(rowSelectionState);
  const selectedRows = selectedRowKeys.map((key) => getRecordByKey(key));

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

  // ====================== Column ======================
  const [mergedColumns, columnsForTTTable, flattenColumns] =
    useColumns<TRecord>(
      {
        ...props,
        ...expandableConfig,
        // expandable:
        //   !!expandableConfig.expandedRowRender &&
        //   (!mergedChildrenColumnName ||
        //     mergedChildrenColumnName in (dataSource?.[0] ?? {})),
        // expandable: !!expandableConfig.expandedRowRender ||
        //   !!expandableConfig.childrenColumnName,
        expandable: !!expandableConfig.expandedRowRender,
        expandColumnTitle: expandableConfig.columnTitle,
        expandedKeys: mergedExpandedKeys,
        getRowKey,
        // https://github.com/ant-design/ant-design/issues/23894
        onTriggerExpand,
        expandIcon: mergedExpandIcon,
        expandIconColumnIndex: expandableConfig.expandIconColumnIndex,
        // direction,
        // scrollWidth: useInternalHooks && tailor && typeof scrollX === 'number' ? scrollX : null,
        // clientWidth: componentWidth,

        //   expandable ??
        //   (data.some((x) => childrenColumnName in x) ? {} : undefined),
        // getRowKey,

        // mergedChildrenColumnName,

        // rowSelection: rowSelection,
      },
      // transformColumns,
      null,
    );

  // Create table instance with memoized values and required properties
  const table = useReactTable({
    data: mergedData,
    columns: [
      ...(rowSelection
        ? [
            {
              id: "__select__",
              header: ({ table }) => (
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  indeterminate={table.getIsSomePageRowsSelected()}
                  onChange={(e) =>
                    table.toggleAllPageRowsSelected(!!e.target.checked)
                  }
                  aria-label="Select all"
                  skipGroup
                  className="align-middle"
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label="Select row"
                />
              ),
              enableSorting: false,
              enableHiding: false,
            } as ColumnDef<TRecord, unknown>,
          ]
        : []),
      ...columnsForTTTable,
    ],
    state: {
      sorting: sortingState,
      rowSelection: Object.fromEntries(
        selectedRowKeys.map((key) => [key.toString(), true]),
      ),
      expanded: expandedState,
    },
    // Core functionality
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow, index) => getRowKey(originalRow, index).toString(),
    // Expandable rows
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) =>
      row[expandable?.childrenColumnName ?? "children"] ?? [],
    // Allow expanding detail rows even when there are no subrows
    getRowCanExpand: () => !!expandable?.expandedRowRender,
    onExpandedChange: handleExpandedChange,
    // Row selection
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const newRowSelection =
        typeof updater === "function"
          ? updater(table.getState().rowSelection)
          : updater;

      const newSelectedRowKeys: React.Key[] = Object.keys(newRowSelection).map(
        (stringKey) => {
          const originalKey = selectedRowKeys.find(
            (key) => key.toString() === stringKey,
          );
          if (originalKey) {
            return originalKey;
          }
          const numKey = Number(stringKey);
          return Number.isNaN(numKey) ? stringKey : numKey;
        },
      );
      // Convert string keys back to React.Key[] by finding the original keys
      // const newSelectedRowKeys: React.Key[] = Object.keys(newRowSelection)
      //   .map((stringKey) => {
      //     // Find the original row that matches this string key
      //     const rowIndex = mergedData.findIndex((item, index) =>
      //       getRowKey(item, index).toString() === stringKey
      //     );
      //     if (rowIndex !== -1) {
      //       return getRowKey(mergedData[rowIndex]!, rowIndex);
      //     }
      //     // Fallback: try to parse as number if possible, otherwise keep as string
      //     const numKey = Number(stringKey);
      //     return isNaN(numKey) ? stringKey : numKey;
      //   })
      //   .filter((key): key is React.Key => key !== undefined);

      setSelectedRowKeys(newSelectedRowKeys);

      const selectedRows = mergedData.filter((item, index) =>
        newSelectedRowKeys.includes(getRowKey(item, index)?.toString()),
      );
      console.log(
        "newRowSelection",
        newRowSelection,
        newSelectedRowKeys,
        selectedRows,
      );

      const info = {
        type: "all" as const,
      };

      rowSelection?.onChange?.(newSelectedRowKeys, selectedRows, info);
    },
    // onRowSelectionChange: setRowSelection,
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

  const bodyColGroup = (
    <ColGroup
      colWidths={flattenColumns.map(({ width }) => width)}
      columns={flattenColumns}
    />
  );

  return (
    <TableStoreProvider>
      <Spin spinning={loading} className={className}>
        <div
          data-slot="table-container"
          className={cn(
            "relative w-full space-y-3 overflow-x-auto",
            scroll?.x && "overflow-x-auto overflow-y-hidden",
            bordered && [
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
            bordered === "around" && [
              "[&_table]:border-separate [&_table]:rounded-md",
            ],
            className,
          )}
          style={style}
        >
          {TableToolbarSection}
          {title && (
            <div
              className={cn(
                "flex items-center justify-between",
                bordered ? "mb-4" : "mb-1",
              )}
            >
              <div className="leading-none font-semibold tracking-tight">
                {title(mergedData)}
              </div>
              {extra && <div>{extra}</div>}
            </div>
          )}
          {TableAlertSection}
          <TableRoot
            ref={ref}
            className={cn(
              !scroll?.x && "w-full",
              // bordered
              // bordered &&
              //   "border-separate border-spacing-0 rounded-md border-s border-t",
              size === "small" ? "[&_th]:" : "",

              classNames?.table,
            )}
            style={{
              ...(scroll?.x
                ? {
                    width: scroll.x,
                    tableLayout: "fixed",
                    minWidth: "100%",
                  }
                : {}),
            }}
            bordered={bordered}
            {...restProps}
          >
            {bodyColGroup}
            {showHeader !== false && (
              <TableHeaderComp
                style={{
                  position: sticky ? "sticky" : undefined,
                  top: sticky
                    ? typeof sticky === "boolean"
                      ? 0
                      : sticky.offsetHeader
                    : undefined,
                  zIndex: sticky ? 11 : undefined,
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
                              : header.column.columnDef.meta?.align === "start"
                                ? "left"
                                : header.column.columnDef.meta?.align ===
                                    "match-parent"
                                  ? undefined
                                  : header.column.columnDef.meta?.align
                          }
                          className={cn(
                            // align
                            header.column.columnDef.meta?.align === "center" &&
                              "text-center",
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
                            header.id === "selection" && "px-0",
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
              <TableBodyComp>
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
                          colSpan={mergedColumns.length}
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
                          data-state={row.getIsSelected() && "selected"}
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

                            if (expandable?.expandRowByClick) {
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
                                  cell.id.endsWith("selection") && "px-0",
                                  // column className
                                  classNames?.cell,
                                  cell.column.columnDef.meta?.className,
                                  cell.column.columnDef.meta?.classNames?.cell,
                                )}
                                style={{
                                  ...getCommonPinningStyles(cell.column),
                                  ...(typeof cell.column.columnDef.meta?.styles
                                    ?.cell === "function"
                                    ? cell.column.columnDef.meta.styles.cell({
                                        record: row.original,
                                        index: row.index,
                                        row,
                                        column: cell.column,
                                      })
                                    : cell.column.columnDef.meta?.styles?.cell),
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
                          expandable?.expandedRowRender && (
                            <TableRow className="bg-primary-50 hover:bg-primary-50">
                              {/* 2nd row is a custom 1 cell row */}
                              <TableCell
                                colSpan={row.getVisibleCells().length}
                                size={size}
                                className={cn(
                                  // "px-4 text-[13px]",
                                  bordered === false && "border-x border-b",
                                )}
                              >
                                {expandable.expandedRowRender(
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
                      colSpan={mergedColumns.length}
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
          {pagination && (
            <Pagination className="my-4 justify-end" {...pagination} />
          )}
        </div>
      </Spin>
    </TableStoreProvider>
  );
};

export { OwnTable };

export type { TableProps as OwnTableProps, RecordWithCustomRow };

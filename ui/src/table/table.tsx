/* eslint-disable @typescript-eslint/no-unsafe-return */
"use client";

import type {
  ExpandedState,
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  Table as TableDef,
} from "@tanstack/react-table";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useMergedState } from "@rc-component/util";
import { warning } from "@rc-component/util/lib/warning";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useScroll, useSize } from "ahooks";
import _ from "lodash";

import type { PaginationProps } from "../pagination";
import type { AnyObject } from "../types";
import type {
  ColumnsDef,
  FilterValue,
  // GetComponent,
  GetRowKey,
  SorterResult,
  TableComponents,
  TableCurrentDataSource,
  TablePaginationConfig,
  TableRowSelection,
} from "./types";
import { cn } from "..";
import { Pagination } from "../pagination";
import { Skeleton } from "../skeleton";
import { Spin } from "../spin";
import { useUiConfig } from "../store";
import {
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRoot,
  TableRow,
} from "./_components";
import { ColGroup } from "./_components/col-group";
import { TableHeadAdvanced } from "./_components/table-head-advanced";
import { useColumns } from "./hooks/use-columns";
import { TableStoreProvider } from "./hooks/use-table";
import { tableLocale_en } from "./locale/en-us";
import { getCommonPinningClassName, getCommonPinningStyles } from "./styles";
import { transformedRowSelection } from "./utils";

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
type TableProps<TRecord extends RecordWithCustomRow = RecordWithCustomRow> =
  Omit<React.ComponentProps<"table">, "title" | "onChange" | "summary"> & {
    columns?: ColumnsDef<TRecord>;
    dataSource?: TRecord[] | undefined;

    title?: React.ReactNode;
    extra?: React.ReactNode;
    alertRender?:
      | React.ReactNode
      | ((args?: {
          selectedRowKeys: TRecord[keyof TRecord][];
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
    };

    // emptyRender?: EmptyProps;
    /** Expandable config */
    expandable?: {
      expandedRowKeys?: string[];
      expandedRowRender: (record: TRecord) => React.ReactNode;
      rowExpandable?: (record: TRecord) => boolean;
      onExpand?: (record: TRecord) => void;
      expandRowByClick?: boolean;
    };
    /** Row key config */
    rowKey?: keyof TRecord;
    /** Row selection config */
    rowSelection?: TableRowSelection<TRecord>;
    pagination?: PaginationProps;
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
    size?: "sm" | "default";
    /** Whether the table can be scrollable */
    scroll?: {
      x: number;
    };
    /** Translation */
    locale?: Partial<
      Record<keyof typeof tableLocale_en.Table, React.ReactNode>
    >;
    /** Override default table elements */
    components?: TableComponents<TRecord>;
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

    onRow?: (ctx: {
      record: TRecord;
      row: Row<TRecord>;
      table: TableDef<TRecord>;
      event: React.MouseEvent;
    }) => void;
  };

const Table = <TRecord extends AnyObject>({
  ref,
  style,
  className,
  bordered: borderedProp,
  size,
  loading = false,
  skeleton = false,

  title,
  extra,
  alertRender,

  columns: columnsProp = [],
  dataSource = [],
  pagination,
  expandable,
  classNames,

  rowKey = "id",
  rowSelection: propRowSelection,

  sticky,
  scroll,
  locale = tableLocale_en.Table,

  components,
  toolbar,
  summary,

  onChange,
  onRow,

  ...props
}: TableProps<TRecord>) => {
  const data = React.useMemo(() => dataSource, [dataSource]);

  // ==================== Customize =====================
  // const getComponent = React.useCallback<GetComponent>(
  //   (path, defaultComponent) => getValue(components, path) || defaultComponent,
  //   [components],
  // );

  const getRowKey = React.useMemo<GetRowKey<TRecord>>(() => {
    if (typeof rowKey === "function") {
      return rowKey;
    }
    return (record: TRecord) => {
      const key = record[rowKey];

      if (process.env.NODE_ENV !== "production") {
        warning(
          key !== undefined,
          "Each record in table should have a unique `key` prop, or set `rowKey` to an unique primary key.",
        );
      }

      return key;
    };
  }, [rowKey]);

  // ====================== Column ======================
  const [columns, columnsForTTTable, flattenColumns] = useColumns<TRecord>(
    {
      columns: columnsProp,
      // selections,
      // rowKey,
      rowSelection: propRowSelection,
      expandable,
      getRowKey,
    },
    null,
  );

  // ====================== Expand ======================
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const defaultPinnings = {
    left: columns.filter((x) => x.key && x.fixed === "left").map((x) => x.key!),
    right: columns
      .filter((x) => x.key && x.fixed === "right")
      .map((x) => x.key!),
  };

  // ====================== Row Selection =======================
  // NOTE: cannot use `useMergedState`
  // NOTE: should keep the selectedRows (if pagination)
  const [selectedRowKeys, setSelectedRowKeys] = useState<
    TRecord[keyof TRecord][]
  >(propRowSelection?.selectedRowKeys ?? []);
  const [selectedRows, setSelectedRows] = useState(
    dataSource.filter((row) => selectedRowKeys.includes(row[rowKey])),
  );
  const rowSelection = transformedRowSelection(
    selectedRowKeys,
    dataSource,
    rowKey,
  );
  useEffect(() => {
    setSelectedRowKeys(propRowSelection?.selectedRowKeys ?? []);
  }, [propRowSelection?.selectedRowKeys, dataSource, rowKey]);
  const onRowSelectionChange: OnChangeFn<RowSelectionState> = (
    updaterOrValue,
  ) => {
    // https://chatgpt.com/c/676154ea-e108-8010-bd5b-abe71b6a529d
    const currentPageRowKeys = new Set(dataSource.map((x) => x[rowKey]));
    const newSelectedKeys: TRecord[keyof TRecord][] =
      typeof updaterOrValue === "function"
        ? (Object.keys(
            updaterOrValue(rowSelection),
          ) as TRecord[keyof TRecord][])
        : (Object.keys(updaterOrValue) as TRecord[keyof TRecord][]);

    // Combine the selected keys and remove any keys that are not on the current page if necessary.
    const updatedSelectedKeys = [
      ...new Set([
        ...selectedRowKeys.filter((key) => !currentPageRowKeys.has(key)),
        ...newSelectedKeys,
      ]),
    ];
    // Update the list of selected rows from the entire current data.
    const updatedSelectedRows = [
      ...selectedRows.filter((row) => !currentPageRowKeys.has(row[rowKey])), // Keep rows from previous pages
      ...dataSource.filter((row) => newSelectedKeys.includes(row[rowKey])), // Add rows from current page
    ];
    setSelectedRowKeys(updatedSelectedKeys);
    setSelectedRows(updatedSelectedRows);

    propRowSelection?.onChange?.(updatedSelectedKeys, updatedSelectedRows);
  };

  // ====================== Sorting =======================
  const collectedSorting: SortingState = columns
    .filter((c) => c.defaultSortOrder && c.key)
    .map((c) => {
      return {
        id: c.key!,
        desc: c.defaultSortOrder === "ascend" ? false : true,
      };
    });
  const [sorting, setSorting] = useMergedState(collectedSorting, {
    onChange: (value) => {
      onChange?.(
        { total: 0, pageSizeOptions: [] },
        {},
        // (value as SortingState | undefined) to fix issue
        (value as SortingState | undefined)?.map((sort) => ({
          column: columnsProp.find(
            (c) => "dataIndex" in c && c.dataIndex === sort.id,
          ),
          field: sort.id,
          columnKey: undefined,
          order: sort.desc ? "descend" : "ascend",
        })) ?? [],
        {
          currentDataSource: dataSource,
          action: "sort",
        },
      );
    },
    postState: (value) => {
      // Sort by priority similar antd
      // (value as SortingState | undefined) to fix issue
      (value as SortingState | undefined)?.sort((a, b) => {
        const columnDefA = columns.find((c) => c.key === a.id);
        const columnDefB = columns.find((c) => c.key === b.id);
        if (
          typeof columnDefA?.sorter === "object" &&
          typeof columnDefB?.sorter === "object"
        ) {
          return columnDefB.sorter.multiple - columnDefA.sorter.multiple;
        }
        return 0;
      });
      // Doesn't change local state if sorting is controlled
      // if (propSorting?.onChange) propSorting.onChange(value);
      return value;
    },
  });

  const table = useReactTable({
    data,
    columns: columnsForTTTable,
    columnResizeMode: "onChange",
    initialState: {
      columnPinning: defaultPinnings,
    },
    state: {
      expanded,
      rowSelection,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    // rowKey
    getRowId: (originalRow) => originalRow[rowKey],
    // expandable
    enableExpanding: !!expandable,
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getSubRows: (record) => record.children as TRecord[],
    onExpandedChange: setExpanded,
    // selection
    enableRowSelection: true,
    onRowSelectionChange,
    // sorting
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    // enableMultiSort: true, // Don't allow shift key to sort multiple columns - default on/true
    isMultiSortEvent: columns.some((col) => typeof col.sorter === "object")
      ? () => true
      : undefined, // Make all clicks multi-sort - default requires `shift` key
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
  const tableConfig = useUiConfig((s) => s.components.table);
  const bordered = borderedProp ?? tableConfig?.bordered ?? false;
  // ---- classes ----//
  const getRowClassName = (row: Row<TRecord>, index: number) => {
    return classNames?.row
      ? typeof classNames.row === "string"
        ? classNames.row
        : classNames.row(row.original, index)
      : "";
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
      <Spin spinning={loading}>
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
                {title}
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
              size === "sm" ? "[&_th]:" : "",

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
            {...props}
          >
            {bodyColGroup}

            <TableHeader
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
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHeadAdvanced
                        key={header.id}
                        locale={locale}
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
            </TableHeader>

            {/* padding with header [disable if bordered]*/}
            {/* {!bordered && <tbody aria-hidden="true" className="h-3"></tbody>} */}

            {skeleton ? (
              <TableBody>
                {Array.from({ length: pagination?.pageSize ?? 5 })
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
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, index) =>
                    "_customRow" in row.original ? (
                      <TableRow
                        key={row.id}
                        className={cn(
                          getRowClassName(row, index),
                          row.original._customRowClassName,
                        )}
                        style={
                          row.original._customRowStyle as React.CSSProperties
                        }
                      >
                        <TableCell
                          colSpan={columns.length}
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
                          data-row-key={row.original[rowKey]}
                          className={cn(
                            row.getIsExpanded() && "bg-gray-50",
                            row.getIsExpanded() && bordered === false
                              ? "border-x"
                              : "",
                            getRowClassName(row, index),
                          )}
                          onClick={(e: React.MouseEvent) => {
                            onRow?.({
                              record: row.original,
                              row,
                              table,
                              event: e,
                            });

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
                        {row.getIsExpanded() && expandable && (
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
                              {expandable.expandedRowRender(row.original)}
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ),
                  )
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={columns.length}
                      className={cn(
                        "text-muted-foreground h-48 text-center",
                        bordered && "border-e",
                      )}
                    >
                      {!loading && locale.emptyText}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}

            {summary && (
              <TableFooter className={classNames?.footer}>
                {summary(dataSource)}
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

export { Table };

export type { TableProps, RecordWithCustomRow };

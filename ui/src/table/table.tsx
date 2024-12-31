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
import type {
  CSSProperties,
  ForwardedRef,
  HTMLAttributes,
  ReactNode,
} from "react";
import React, {
  forwardRef,
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useScroll, useSize } from "ahooks";
import _ from "lodash";
import { useMergedState } from "rc-util";

import type { SortableContextProps } from "../drag-and-drop";
import type { PaginationProps } from "../pagination";
import type { AnyObject } from "../types";
import type { RowSelection, TableColumnDef, TableComponents } from "./types";
import { cn } from "..";
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
} from "./_components";
import { TableHeadAdvanced } from "./_components/table-head-advanced";
import { tableLocale_en } from "./locale/en-us";
import { getCommonPinningClassName, getCommonPinningStyles } from "./styles";
import { transformColumnDefs, transformedRowSelection } from "./utils";

type RecordWithCustomRow<TRecord extends AnyObject = AnyObject> =
  | (TRecord & {
      _customRow?: undefined;
      _customRowClassName?: undefined;
    })
  | (Partial<TRecord> & {
      _customRow: ReactNode;
      _customRowClassName?: string;
      _customCellClassName?: string;
      _customRowStyle?: CSSProperties;
    });
type TableProps<TRecord extends RecordWithCustomRow = RecordWithCustomRow> =
  HTMLAttributes<HTMLTableElement> & {
    columns?: TableColumnDef<TRecord>[];
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
      th?: string;
      td?: string;
    };

    // emptyRender?: EmptyProps;
    /** Expandable config */
    expandable?: {
      expandedRowKeys?: string[];
      expandedRowRender: (record: TRecord) => ReactNode;
      rowExpandable?: (record: TRecord) => boolean;
      onExpand?: (record: TRecord) => void;
    };
    /** Row key config */
    rowKey?: keyof TRecord;
    /** Row selection config */
    rowSelection?: RowSelection<TRecord>;
    sorting?: {
      default?: SortingState;
      state?: SortingState;
      onChange?: (state: SortingState) => void;
    };
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
    locale?: Partial<Record<keyof typeof tableLocale_en.Table, ReactNode>>;
    /** Override default table elements */
    components?: TableComponents<TRecord>;
    /** Toolbar */
    toolbar?: (table: TableDef<TRecord>) => React.JSX.Element;
    /** Summary content */
    summary?: (currentData: TRecord[]) => React.ReactNode;

    dnd?: Pick<SortableContextProps, "onDragEnd">;
  };

const TableInner = <TRecord extends AnyObject>(
  {
    style,
    className,
    bordered = false,
    size,
    loading = false,
    skeleton = false,

    title,
    extra,
    alertRender,

    columns: propColumns = [],
    dataSource = [],
    pagination,
    expandable,
    classNames,

    rowKey = "id",
    rowSelection: propRowSelection,
    sorting: propSorting,

    sticky,
    scroll,
    locale = tableLocale_en.Table,

    dnd,

    components,
    toolbar,
    summary,

    ...props
  }: TableProps<TRecord>,
  ref: ForwardedRef<HTMLTableElement>,
) => {
  const data = React.useMemo(() => dataSource, [dataSource]);
  const columns = React.useMemo(
    () =>
      transformColumnDefs(propColumns, {
        rowKey,
        rowSelection: propRowSelection,
        expandable,
        dnd,
        sorting: propSorting,
      }),
    [propColumns, rowKey, propRowSelection, expandable, dnd, propSorting],
  );

  const [expanded, setExpanded] = useState<ExpandedState>({});

  const defaultPinnings = {
    left: propColumns
      .map((x, index) => ({
        key: x.dataIndex?.toString() ?? index.toString(),
        fixed: x.fixed,
      }))
      .filter((x) => x.fixed === "left")
      .map((x) => x.key),
    right: propColumns
      .map((x, index) => ({
        key: x.dataIndex?.toString() ?? index.toString(),
        fixed: x.fixed,
      }))
      .filter((x) => x.fixed === "right")
      .map((x) => x.key),
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
  const [sorting, setSorting] = useMergedState(propSorting?.default ?? [], {
    value: propSorting?.state,
    onChange: propSorting?.onChange,
    postState: (value) => {
      // Sort by priority
      value.sort((a, b) => {
        const columnDefA = columns.find((c) => c.id === a.id);
        const columnDefB = columns.find((c) => c.id === b.id);
        if (
          typeof columnDefA?.meta?.sorter === "object" &&
          typeof columnDefB?.meta?.sorter === "object"
        ) {
          return (
            columnDefB.meta.sorter.multiple - columnDefA.meta.sorter.multiple
          );
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
    columns,
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
    isMultiSortEvent: columns.some(
      (col) => typeof col.meta?.sorter === "object",
    )
      ? () => true
      : undefined, // Make all clicks multi-sort - default requires `shift` key
  });

  // ---- Table styles ----//
  let tableStyles: CSSProperties = {};
  if (scroll?.x) {
    tableStyles = {
      width: scroll.x,
      tableLayout: "fixed",
      minWidth: "100%",
    };
  }

  // ====================== Scroll ======================
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

  const TableToolbarSection = toolbar ? (
    <div className="mb-4">{toolbar(table)}</div>
  ) : undefined;
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

  // ---- classes ----//
  const getRowClassName = (row: Row<TRecord>, index: number) => {
    return classNames?.row
      ? typeof classNames.row === "string"
        ? classNames.row
        : classNames.row(row.original, index)
      : "";
  };

  return (
    <>
      <Spin
        spinning={loading}
        className={cn(
          "relative space-y-4",
          "w-full overflow-auto",
          scroll?.x && "overflow-x-auto overflow-y-hidden",
          bordered && [
            // "[&_table]:border-separate",
            "[&_table]:border-spacing-0 [&_table]:rounded-md [&_table]:border",
            typeof bordered === "boolean" &&
              "[&_th:last-child]:border-e-0 [&_th]:border-e",
            typeof bordered === "boolean" &&
              "[&_td:last-child]:border-e-0 [&_td]:border-e",
          ],
          (!bordered || bordered === "around") && [
            "[&_th:last-child]:before:bg-transparent [&_th]:before:absolute [&_th]:before:right-0 [&_th]:before:top-1/2 [&_th]:before:h-[1.6em] [&_th]:before:w-px [&_th]:before:-translate-y-1/2 [&_th]:before:bg-accent [&_th]:before:content-['']",
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
            <div className="font-semibold leading-none tracking-tight">
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
          style={tableStyles}
          {...props}
        >
          {columns.some((column) => column.size) && (
            <colgroup>
              {columns.map((col, index) => (
                <col
                  key={index}
                  {...(col.size === undefined
                    ? {}
                    : { style: { width: col.size } })}
                />
              ))}
            </colgroup>
          )}

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
                      className={cn(
                        // column className
                        header.column.columnDef.meta?.className,
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
                        classNames?.th,
                      )}
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
              {Array.from({ length: 5 })
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
                        row.original._customRowClassName as string,
                      )}
                      style={row.original._customRowStyle as CSSProperties}
                    >
                      <TableCell
                        colSpan={columns.length}
                        size={size}
                        className={cn(
                          row.original._customCellClassName as string,
                        )}
                      >
                        {row.original._customRow as React.ReactNode}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <Fragment key={row.id}>
                      <TableRowComp
                        data-state={row.getIsSelected() && "selected"}
                        data-row-key={row.original[rowKey]}
                        className={cn(
                          row.getIsExpanded() ? "border-x" : "",
                          getRowClassName(row, index),
                        )}
                      >
                        {row.getVisibleCells().map((cell) => {
                          return (
                            <TableCell
                              key={cell.id}
                              size={size}
                              style={getCommonPinningStyles(cell.column)}
                              className={cn(
                                // align
                                cell.column.columnDef.meta?.align ===
                                  "center" && "text-center",
                                cell.column.columnDef.meta?.align === "right" &&
                                  "text-right",
                                // pinning
                                // scroll?.x &&
                                getCommonPinningClassName(cell.column, {
                                  scrollLeft: wrapperScrollLeft,
                                  scrollRight: wrapperScrollRight,
                                }),
                                // selection column
                                cell.id.endsWith("selection") && "px-0",
                                // column className
                                classNames?.td,
                                cell.column.columnDef.meta?.className,
                                cell.column.columnDef.meta?.classNames?.td,
                              )}
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
                        <TableRow className="bg-gray-50">
                          {/* 2nd row is a custom 1 cell row */}
                          <TableCell
                            colSpan={row.getVisibleCells().length}
                            size={size}
                            className="border-x border-b px-4 text-[13px]"
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
                    className={cn("h-48 text-center", bordered && "border-e")}
                  >
                    {!loading && locale.emptyText}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}

          {summary && (
            <TableFooter
              className={classNames?.footer}
              // flattenColumns={[]}
              // stickyOffsets={{ left: 0, right: 0 }}
            >
              {summary(dataSource)}
            </TableFooter>
          )}
        </TableRoot>
        {pagination && <Pagination className="my-4" {...pagination} />}
      </Spin>
    </>
  );
};

const Table = forwardRef(TableInner) as <T extends AnyObject>(
  props: TableProps<T> & { ref?: ForwardedRef<HTMLTableElement> },
) => ReturnType<typeof TableInner>;

export { Table };

export type { TableProps, RecordWithCustomRow };

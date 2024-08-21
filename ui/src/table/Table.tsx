"use client";

import type { ExpandedState, SortingState } from "@tanstack/react-table";
import type {
  CSSProperties,
  ForwardedRef,
  HTMLAttributes,
  ReactNode,
} from "react";
import React, { forwardRef, Fragment, useRef, useState } from "react";
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

import type { PaginationProps } from "../pagination";
import type { RowSelection, TableColumnDef } from "./types";
import { clsm } from "..";
import { Icon } from "../icons";
import { Pagination } from "../pagination";
import { Skeleton } from "../skeleton";
import { Spin } from "../spin";
import { Tooltip } from "../tooltip";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "./_components";
import { tableLocale_en } from "./locale/en_US";
import { getCommonPinningClassName, getCommonPinningStyles } from "./styles";
import { transformColumnDefs } from "./utils";

type RecordWithCustomRow<
  TRecord extends Record<string, unknown> = Record<string, unknown>,
> =
  | (TRecord & {
      _customRow?: undefined;
      _customRowClassName?: undefined;
    })
  | (Partial<TRecord> & {
      _customRow: ReactNode;
      _customRowClassName: string;
    });
type TableProps<TRecord extends RecordWithCustomRow> =
  HTMLAttributes<HTMLTableElement> & {
    columns?: TableColumnDef<TRecord>[];
    dataSource?: TRecord[] | undefined;
    bordered?: boolean;
    // emptyRender?: EmptyProps;
    /** Expandable config */
    expandable?: {
      expandedRowKeys?: string[];
      expandedRowRender: (record: TRecord) => ReactNode;
      rowExpandable?: (record: TRecord) => boolean;
      onExpand?: (record: TRecord) => void;
    };
    rowKey?: keyof TRecord;
    rowClassName?: (record: TRecord, index: number) => string;
    /** Row selection config */
    rowSelection?: RowSelection<TRecord>;
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
    locale?: typeof tableLocale_en.Table;
  };

const TableInner = <TRecord extends Record<string, unknown>>(
  {
    className,
    bordered,
    size,
    loading = false,
    skeleton = false,

    columns: columnsProp = [],
    dataSource = [],
    pagination,
    expandable,
    rowKey = "id",
    rowClassName,
    rowSelection: rowSelectionProp,

    sticky,
    scroll,
    locale = tableLocale_en.Table,
    ...props
  }: TableProps<TRecord>,
  ref: ForwardedRef<HTMLTableElement>,
) => {
  const data = React.useMemo(() => dataSource, [dataSource]);
  const columns = React.useMemo(
    () =>
      transformColumnDefs(columnsProp, {
        rowKey,
        rowSelection: rowSelectionProp,
        expandable,
      }),
    [columnsProp, rowKey, rowSelectionProp, expandable],
  );

  const [expanded, setExpanded] = useState<ExpandedState>({});

  const defaultPinnings = {
    left: columnsProp
      .map((x, index) => ({
        key: x.dataIndex?.toString() ?? index.toString(),
        fixed: x.fixed,
      }))
      .filter((x) => x.fixed === "left")
      .map((x) => x.key),
    right: columnsProp
      .map((x, index) => ({
        key: x.dataIndex?.toString() ?? index.toString(),
        fixed: x.fixed,
      }))
      .filter((x) => x.fixed === "right")
      .map((x) => x.key),
  };

  const [rowSelection, setRowSelection] = useMergedState(
    {},
    {
      value: (() => {
        const rowSelectionTst: Record<string, boolean> = {};
        rowSelectionProp?.selectedRowKeys?.forEach((x) => {
          const index = dataSource.findIndex((d) => d[rowKey] === x);
          if (index > -1) rowSelectionTst[index] = true;
        });
        return rowSelectionTst;
      })(),
      onChange: (value) => {
        if (rowSelectionProp) {
          const selectedRowKeys = Object.keys(value).map(
            (k) => dataSource[parseInt(k)]![rowKey],
          );
          rowSelectionProp.onChange?.(
            _.union(
              // ignore already selected in other pages
              _.filter(
                rowSelectionProp.selectedRowKeys ?? [],
                (n) => !dataSource.map((x) => x[rowKey]).includes(n),
              ),
              selectedRowKeys,
            ),
          );
        }
      },
    },
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

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
    // expandable
    enableExpanding: !!expandable,
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getSubRows: (record) => record.children as TRecord[],
    onExpandedChange: setExpanded,
    // selection
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    // sorting
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
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

  // ---- scroll X ----//
  // ---- to show or disable box-shadow ----//
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wrapperSize = useSize(wrapperRef);
  const wrapperWidth = wrapperSize?.width ?? scroll?.x ?? 0;
  const wrapperScroll = useScroll(wrapperRef);
  const wrapperScrollLeft = wrapperScroll?.left ?? 0;
  const wrapperScrollRight =
    (scroll?.x ?? 0) - (wrapperWidth + wrapperScrollLeft);

  return (
    <>
      <Spin spinning={loading} className="relative">
        <div
          ref={wrapperRef}
          className={clsm(scroll?.x && "overflow-x-auto overflow-y-hidden")}
        >
          <TableRoot
            ref={ref}
            className={clsm(
              !scroll?.x && "w-full",
              "caption-bottom text-sm",
              // bordered
              bordered &&
                "border-separate border-spacing-0 rounded-md border-s border-t",
              size === "sm" ? "[&_th]:" : "",
              className,
            )}
            style={tableStyles}
            {...props}
          >
            {columns.some((column) => column.size) && (
              <colgroup>
                {columns.map((col, index) => (
                  <col
                    key={index}
                    {...(col.size ? { style: { width: col.size } } : {})}
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
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        scope="col"
                        colSpan={header.colSpan}
                        size={size}
                        style={getCommonPinningStyles(header.column)}
                        className={clsm(
                          // column className
                          header.column.columnDef.meta?.className,
                          // bordered
                          bordered && "border-b border-e",
                          // align
                          header.column.columnDef.meta?.align === "center" &&
                            "text-center",
                          header.column.columnDef.meta?.align === "right" &&
                            "text-right",
                          // pinning
                          scroll?.x &&
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
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <Tooltip
                          title={
                            header.column.getCanSort()
                              ? header.column.getNextSortingOrder() === "asc"
                                ? locale.triggerAsc
                                : header.column.getNextSortingOrder() === "desc"
                                  ? locale.triggerDesc
                                  : locale.cancelSort
                              : undefined
                          }
                        >
                          <span
                            className={clsm(
                              // sorting
                              header.column.getCanSort() &&
                                "flex cursor-pointer items-center justify-between",
                            )}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                            {header.column.getCanSort() ? (
                              <div>
                                <Icon
                                  icon="ant-design:caret-up-filled"
                                  className={clsm(
                                    "size-3",
                                    header.column.getIsSorted() !== "asc" &&
                                      "text-gray-400",
                                  )}
                                />
                                <Icon
                                  icon="ant-design:caret-down-filled"
                                  className={clsm(
                                    "-mt-1 size-3",
                                    header.column.getIsSorted() !== "desc" &&
                                      "text-gray-400",
                                  )}
                                />
                              </div>
                            ) : null}
                          </span>
                        </Tooltip>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <tbody aria-hidden="true" className="h-3"></tbody>

            {!skeleton ? (
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row, index) =>
                    row.original._customRow ? (
                      <TableRow key={row.id}>
                        <TableCell
                          colSpan={columns.length}
                          size={size}
                          className={clsm(
                            row.original._customRowClassName as string,
                          )}
                        >
                          {row.original._customRow as React.ReactNode}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <Fragment key={row.id}>
                        <TableRow
                          data-state={row.getIsSelected() && "selected"}
                          className={clsm(
                            rowClassName?.(row.original, index),
                            row.getIsExpanded() ? "border-x" : "",
                          )}
                        >
                          {row.getVisibleCells().map((cell) => {
                            return (
                              <TableCell
                                key={cell.id}
                                size={size}
                                style={getCommonPinningStyles(cell.column)}
                                className={clsm(
                                  // column className
                                  cell.column.columnDef.meta?.className,
                                  // row className
                                  // typeof cell.column.columnDef.meta?.className ===
                                  //   "string"
                                  //   ? cell.column.columnDef.meta.className
                                  //   : cell.column.columnDef.meta?.className?.(
                                  //       row.original,
                                  //       index,
                                  //     ),
                                  // bordered
                                  bordered && "border-e",
                                  // align
                                  cell.column.columnDef.meta?.align ===
                                    "center" && "text-center",
                                  cell.column.columnDef.meta?.align ===
                                    "right" && "text-right",
                                  // pinning
                                  scroll?.x &&
                                    getCommonPinningClassName(cell.column, {
                                      scrollLeft: wrapperScrollLeft,
                                      scrollRight: wrapperScrollRight,
                                    }),
                                  // selection column
                                  cell.id.endsWith("selection") && "px-0",
                                )}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                        {row.getIsExpanded() && expandable && (
                          <TableRow className="bg-gray-50">
                            {/* 2nd row is a custom 1 cell row */}
                            <TableCell
                              colSpan={row.getVisibleCells().length}
                              size={size}
                              className="border-x border-b px-2 text-[13px]"
                            >
                              {expandable.expandedRowRender(row.original)}
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ),
                  )
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className={clsm(
                        "h-48 text-center",
                        bordered && "border-e",
                      )}
                    >
                      {!loading && "No data"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            ) : (
              <TableBody>
                {Array(5)
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
            )}
          </TableRoot>
        </div>
        {pagination && <Pagination className="my-4" {...pagination} />}
      </Spin>
    </>
  );
};

const Table = forwardRef(TableInner) as <T extends Record<string, unknown>>(
  props: TableProps<T> & { ref?: ForwardedRef<HTMLUListElement> },
) => ReturnType<typeof TableInner>;

export { Table };

export type { TableProps, RecordWithCustomRow };

"use client";

import type {
  ExpandedState,
  SortingState,
  Table as TableDef,
} from "@tanstack/react-table";
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

import type { SortableContextProps } from "../drag-and-drop";
import type { PaginationProps } from "../pagination";
import type { RowSelection, TableColumnDef, TableComponents } from "./types";
import { cn } from "..";
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
import { tableLocale_en } from "./locale/en-us";
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
      _customRowClassName?: string;
      _customCellClassName?: string;
      _customRowStyle?: CSSProperties;
    });
type TableProps<TRecord extends RecordWithCustomRow = RecordWithCustomRow> =
  HTMLAttributes<HTMLTableElement> & {
    columns?: TableColumnDef<TRecord>[];
    dataSource?: TRecord[] | undefined;
    bordered?: boolean | "wrapper";
    // emptyRender?: EmptyProps;
    /** Expandable config */
    expandable?: {
      expandedRowKeys?: string[];
      expandedRowRender: (record: TRecord) => ReactNode;
      rowExpandable?: (record: TRecord) => boolean;
      onExpand?: (record: TRecord) => void;
    };
    rowKey?: keyof TRecord;
    classNames?: {
      header?: string;
      row?: string | ((record: TRecord, index: number) => string);
      th?: string;
      td?: string;
    };
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
    locale?: Partial<Record<keyof typeof tableLocale_en.Table, ReactNode>>;
    /** Override default table elements */
    components?: TableComponents<TRecord>;
    /** Toolbar */
    toolbar?: (table: TableDef<TRecord>) => JSX.Element;

    dnd?: Pick<SortableContextProps, "onDragEnd">;
  };

const TableInner = <TRecord extends Record<string, unknown>>(
  {
    className,
    bordered,
    size,
    loading = false,
    skeleton = false,

    columns: propColumns = [],
    dataSource = [],
    pagination,
    expandable,
    rowKey = "id",
    classNames,
    rowSelection: propRowSelection,

    sticky,
    scroll,
    locale = tableLocale_en.Table,

    dnd,

    components,
    toolbar,
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
      }),
    [propColumns, rowKey, propRowSelection, expandable, dnd],
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

  const [rowSelection, setRowSelection] = useMergedState(
    {},
    {
      value: (() => {
        const rowSelectionTst: Record<string, boolean> = {};
        if (propRowSelection?.selectedRowKeys)
          if (rowKey) {
            for (const x of propRowSelection.selectedRowKeys) {
              rowSelectionTst[x as string] = true;
              // const index = dataSource.findIndex((d) => d[rowKey] === x);
              // if (index !== -1) rowSelectionTst[index] = true;
            }
          } else {
            for (const x of propRowSelection.selectedRowKeys) {
              const index = dataSource.findIndex((d) => d[rowKey] === x);
              if (index !== -1) rowSelectionTst[index] = true;
            }
          }
        return rowSelectionTst;
      })(),
      onChange: (value) => {
        if (propRowSelection) {
          const selectedRowKeys = Object.keys(value).map(
            // (k) => dataSource[Number.parseInt(k)]![rowKey],
            (k) => k as TRecord[keyof TRecord],
          );
          propRowSelection.onChange?.(
            _.union(
              // ignore already selected in other pages
              _.filter(
                propRowSelection.selectedRowKeys ?? [],
                (n) => !dataSource.map((x) => x[rowKey]).includes(n),
              ),
              selectedRowKeys,
            ),
            dataSource.filter((row) => selectedRowKeys.includes(row[rowKey])),
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
    // rowKey
    getRowId: (originalRow) => originalRow[rowKey] as string,
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

  const TableRowComp =
    components?.body && "row" in components.body && components.body.row
      ? components.body.row
      : TableRow;

  return (
    <>
      <Spin spinning={loading} className={cn("relative space-y-4", className)}>
        {toolbar?.(table)}
        <div
          // ref={wrapperRef}
          className={cn(
            scroll?.x && "overflow-x-auto overflow-y-hidden",
            toolbar && "mt-4",
            "rounded-md border",
          )}
        >
          <TableRoot
            ref={ref}
            className={cn(
              !scroll?.x && "w-full",
              // bordered
              // bordered &&
              //   "border-separate border-spacing-0 rounded-md border-s border-t",
              size === "sm" ? "[&_th]:" : "",
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
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        scope="col"
                        colSpan={header.colSpan}
                        size={size}
                        style={getCommonPinningStyles(header.column)}
                        className={cn(
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
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <Tooltip
                          open={header.column.getCanSort()}
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
                            className={cn(
                              // sorting
                              header.column.getCanSort() &&
                                "flex cursor-pointer items-center justify-between",
                            )}
                          >
                            {header.isPlaceholder
                              ? undefined
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                            {header.column.getCanSort() ? (
                              <div>
                                <Icon
                                  icon="ant-design:caret-up-filled"
                                  className={cn(
                                    "size-3",
                                    header.column.getIsSorted() !== "asc" &&
                                      "text-gray-400",
                                  )}
                                />
                                <Icon
                                  icon="ant-design:caret-down-filled"
                                  className={cn(
                                    "-mt-1 size-3",
                                    header.column.getIsSorted() !== "desc" &&
                                      "text-gray-400",
                                  )}
                                />
                              </div>
                            ) : undefined}
                          </span>
                        </Tooltip>
                      </TableHead>
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
                        {/* {components?.body && */}
                        {/* "row" in components.body && */}
                        {/* components.body.row ? ( */}
                        {/*   <components.body.row> */}
                        {/*     {row.getVisibleCells().map((cell) => { */}
                        {/*       return ( */}
                        {/*         <TableCell */}
                        {/*           key={cell.id} */}
                        {/*           size={size} */}
                        {/*           style={getCommonPinningStyles(cell.column)} */}
                        {/*           className={cn( */}
                        {/*             // row className */}
                        {/*             // typeof cell.column.columnDef.meta?.className === */}
                        {/*             //   "string" */}
                        {/*             //   ? cell.column.columnDef.meta.className */}
                        {/*             //   : cell.column.columnDef.meta?.className?.( */}
                        {/*             //       row.original, */}
                        {/*             //       index, */}
                        {/*             //     ), */}
                        {/*             // bordered */}
                        {/*             bordered && "border-e", */}
                        {/*             // align */}
                        {/*             cell.column.columnDef.meta?.align === "center" && */}
                        {/*               "text-center", */}
                        {/*             cell.column.columnDef.meta?.align === "right" && */}
                        {/*               "text-right", */}
                        {/*             // pinning */}
                        {/*             // scroll?.x && */}
                        {/*             getCommonPinningClassName(cell.column, { */}
                        {/*               scrollLeft: wrapperScrollLeft, */}
                        {/*               scrollRight: wrapperScrollRight, */}
                        {/*             }), */}
                        {/*             // selection column */}
                        {/*             cell.id.endsWith("selection") && "px-0", */}
                        {/*             // column className */}
                        {/*             cell.column.columnDef.meta?.className, */}
                        {/*           )} */}
                        {/*         > */}
                        {/*           {flexRender( */}
                        {/*             cell.column.columnDef.cell, */}
                        {/*             cell.getContext(), */}
                        {/*           )} */}
                        {/*         </TableCell> */}
                        {/*       ); */}
                        {/*     })} */}
                        {/*   </components.body.row> */}
                        {/* ) : ( */}
                        {/*   <></> */}
                        {/* )} */}
                        <TableRowComp
                          data-state={row.getIsSelected() && "selected"}
                          data-row-key={row.original[rowKey]}
                          className={cn(
                            classNames?.row
                              ? typeof classNames.row === "string"
                                ? classNames.row
                                : classNames.row(row.original, index)
                              : "",
                            // classNames.row?.className,
                            // rowClassName?.(row.original, index),
                            row.getIsExpanded() ? "border-x" : "",
                          )}
                        >
                          {row.getVisibleCells().map((cell) => {
                            return (
                              <TableCell
                                key={cell.id}
                                size={size}
                                style={getCommonPinningStyles(cell.column)}
                                className={cn(
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
          </TableRoot>
        </div>
        {pagination && <Pagination className="my-4" {...pagination} />}
      </Spin>
    </>
  );
};

const Table = forwardRef(TableInner) as <T extends Record<string, unknown>>(
  props: TableProps<T> & { ref?: ForwardedRef<HTMLTableElement> },
) => ReturnType<typeof TableInner>;

export { Table };

export type { TableProps, RecordWithCustomRow };

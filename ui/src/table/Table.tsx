"use client";

import type { ExpandedState, SortingState } from "@tanstack/react-table";
import type {
  CSSProperties,
  ForwardedRef,
  HTMLAttributes,
  ReactNode,
} from "react";
import React, { forwardRef, useRef, useState } from "react";
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
import { useTranslation } from "../../../../apps/nextjs/src/locales/client";
import { Icon } from "../icons";
import { Pagination } from "../pagination";
import { Tooltip } from "../tooltip";
import { getCommonPinningClassName, getCommonPinningStyles } from "./styles";
import { TableBody } from "./TableBody";
import { TableCell } from "./TableCell";
import { TableHead } from "./TableHead";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
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
    columns: TableColumnDef<TRecord>[];
    dataSource: TRecord[] | undefined;
    bordered?: boolean;
    // emptyRender?: EmptyProps;
    expandable?: {
      expandedRowKeys: string[];
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
    /** Set sticky header and scroll bar */
    sticky?:
      | boolean
      | {
          offsetHeader?: number;
          offsetScroll?: number;
          getContainer?: () => HTMLElement;
        };
    size?: "smal" | "default";
    /** Whether the table can be scrollable */
    scroll?: {
      x: number;
    };
  };

const TableInner = <TRecord extends Record<string, unknown>>(
  {
    className,
    columns: columnsProp,
    dataSource = [],
    pagination,
    rowKey = "id",
    rowClassName,
    rowSelection: rowSelectionProp,
    sticky,
    scroll,
    ...props
  }: TableProps<TRecord>,
  ref: ForwardedRef<HTMLTableElement>,
) => {
  const { t } = useTranslation();

  const data = React.useMemo(() => dataSource, [dataSource]);
  const columns = React.useMemo(
    () =>
      transformColumnDefs(columnsProp, {
        rowKey,
        rowSelection: rowSelectionProp,
      }),
    [columnsProp, rowKey, rowSelectionProp],
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
    getSubRows: (record) => record.children as TRecord[],
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
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
      <div className="relative">
        <div
          ref={wrapperRef}
          className={clsm(scroll?.x && "overflow-x-auto overflow-y-hidden")}
        >
          {/* {loading && <Loader backdrop className="tw-z-10" />} */}
          <table
            ref={ref}
            className={clsm(
              !scroll?.x && "w-full",
              "caption-bottom text-sm",
              "border-separate border-spacing-0",
              // bordered &&
              //   "tw-border tw-rounded-xl tw-border-solid tw-border-neutral-40",
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
                        style={getCommonPinningStyles(header.column)}
                        className={clsm(
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
                                ? t("Table.triggerAsc")
                                : header.column.getNextSortingOrder() === "desc"
                                  ? t("Table.triggerDesc")
                                  : t("Table.cancelSort")
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

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) =>
                  row.original._customRow ? (
                    <TableRow key={row.id}>
                      <TableCell
                        colSpan={columns.length}
                        className={clsm(
                          row.original._customRowClassName as string,
                        )}
                      >
                        {row.original._customRow as React.ReactNode}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={rowClassName?.(row.original, index)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <TableCell
                            key={cell.id}
                            style={getCommonPinningStyles(cell.column)}
                            className={clsm(
                              typeof cell.column.columnDef.meta?.className ===
                                "string"
                                ? cell.column.columnDef.meta.className
                                : cell.column.columnDef.meta?.className?.(
                                    row.original,
                                    index,
                                  ),
                              // align
                              cell.column.columnDef.meta?.align === "center" &&
                                "text-center",
                              cell.column.columnDef.meta?.align === "right" &&
                                "text-right",
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
                  ),
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
        {pagination && <Pagination className="my-4" {...pagination} />}
      </div>
    </>
  );
};

const Table = forwardRef(TableInner) as <T extends Record<string, unknown>>(
  props: TableProps<T> & { ref?: ForwardedRef<HTMLUListElement> },
) => ReturnType<typeof TableInner>;

export { Table };

export type { TableProps, RecordWithCustomRow };

"use client";

/*
 *
 * https://ant.design/components/table#components-table-demo-expand
 *
 */
import type { ExpandedState } from "@tanstack/react-table";
import type { ForwardedRef, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { clsm } from "@vyductan/utils";

import type { PaginationProps } from "../pagination";
import type { TableColumnDef } from "./types";
import { Pagination } from "../pagination";
import { TableBody } from "./TableBody";
import { TableCell } from "./TableCell";
import { TableHead } from "./TableHead";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { transformColumnDefs } from "./utils";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

type TableProps<TRecord extends Record<string, unknown>> =
  HTMLAttributes<HTMLTableElement> & {
    columns: TableColumnDef<TRecord>[];
    dataSource: TRecord[];
    // emptyRender?: EmptyProps;
    expandable?: {
      expandedRowKeys: string[];
      expandedRowRender: (record: TRecord) => ReactNode;
      rowExpandable?: (record: TRecord) => boolean;
      onExpand?: (record: TRecord) => void;
    };
    rowKey?: keyof TRecord;
    pagination?: PaginationProps;

    bordered?: boolean;
    loading?: boolean;
    sticky?: boolean;
    size?: "smal" | "default";

    scroll?: {
      x: boolean;
    };
  };

const TableInner = <TRecord extends Record<string, unknown>>(
  {
    className,
    columns,
    dataSource,
    pagination,

    sticky,
    scroll,
    ...props
  }: TableProps<TRecord>,
  ref: ForwardedRef<HTMLTableElement>,
) => {
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data: dataSource,
    columns: transformColumnDefs(columns),
    columnResizeMode: "onChange",
    state: {
      expanded,
    },
    getCoreRowModel: getCoreRowModel(),

    getSubRows: (record) => record.children as TRecord[],
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="relative w-full overflow-x-auto">
      {/* {loading && <Loader backdrop className="tw-z-10" />} */}
      <table
        ref={ref}
        className={clsm(
          "w-full caption-bottom text-sm",
          "border-separate",
          // bordered &&
          //   "tw-border tw-rounded-xl tw-border-solid tw-border-neutral-40",
          className,
        )}
        style={{
          ...(scroll?.x
            ? {
                width: table.getCenterTotalSize(),
              }
            : {}),
        }}
        {...props}
      >
        <TableHeader className={clsm("", sticky ? "sticky top-0" : "")}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    {...(header.column.columnDef.size
                      ? {
                          style: {
                            width: header.getSize(),
                          },
                        }
                      : {})}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    {...(cell.column.columnDef.size
                      ? {
                          style: {
                            width: cell.column.getSize(),
                          },
                        }
                      : {})}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </table>
      {pagination && <Pagination {...pagination} />}
    </div>
  );
};

const Table = forwardRef(TableInner) as <T extends Record<string, unknown>>(
  props: TableProps<T> & { ref?: ForwardedRef<HTMLUListElement> },
) => ReturnType<typeof TableInner>;

export { Table };

export type { TableProps };

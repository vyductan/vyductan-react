"use client";

/*
 *
 * https://ant.design/components/table#components-table-demo-expand
 *
 */
import type { ColumnDef, ExpandedState } from "@tanstack/react-table";
import type { ForwardedRef, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { clsm } from "@vyductan/utils";

import type { TableColumnDef } from "./types";
import { TableBody } from "./TableBody";
import { TableCell } from "./TableCell";
import { TableHead } from "./TableHead";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";

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
    bordered?: boolean;
    // emptyRender?: EmptyProps;
    expandable?: {
      expandedRowKeys: string[];
      expandedRowRender: (record: TRecord) => ReactNode;
      rowExpandable?: (record: TRecord) => boolean;
      onExpand?: (record: TRecord) => void;
    };
    rowKey?: keyof TRecord;
    loading?: boolean;
    // pagination?: BPPaginationWithStateProps;
    sticky?: boolean;
    size?: "smal" | "default";
  };

const TableInner = <TRecord extends Record<string, unknown>>(
  { className, columns, dataSource, sticky, ...props }: TableProps<TRecord>,
  ref: ForwardedRef<HTMLTableElement>,
) => {
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const columnsDef: ColumnDef<TRecord>[] = columns.map(
    ({ dataIndex, title, render, width }, index) => {
      const columnDefMerged: ColumnDef<TRecord> = {
        id: dataIndex?.toString() ?? index.toString(),
        accessorKey: dataIndex,
        header: () => title,
        size: width,
      };
      columnDefMerged.cell = ({ row, getValue }) => (
        <>
          {row.getCanExpand() ? (
            <button
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: {
                  cursor: "pointer",
                  paddingLeft: `${row.depth * 2}rem`,
                },
              }}
            >
              {row.getIsExpanded() ? "👇" : "👉"}
            </button>
          ) : (
            <span
              style={{
                paddingLeft: `${row.depth * 2}rem`,
              }}
            />
          )}

          {/* render value*/}
          {render
            ? typeof dataIndex === "string"
              ? render(getValue() as never, row.original, row.index)
              : render(undefined as never, row.original, row.index)
            : getValue()}
        </>
      );
      return columnDefMerged;
    },
  );
  const table = useReactTable({
    data: dataSource,
    columns: columnsDef,
    state: {
      expanded,
    },
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,

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
        // style={
        //   {
        //     width: table.getCenterTotalSize(),
        //   }
        // }
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
      {/* {pagination && <BPPaginationWithState {...pagination} />} */}
    </div>
  );
};

const Table = forwardRef(TableInner) as <T extends Record<string, unknown>>(
  props: TableProps<T> & { ref?: ForwardedRef<HTMLUListElement> },
) => ReturnType<typeof TableInner>;

export { Table };

export type { TableProps };

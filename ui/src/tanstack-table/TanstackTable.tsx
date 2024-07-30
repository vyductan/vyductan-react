"use client";

import type { ColumnDef, RowData } from "@tanstack/react-table";
import { useMemo } from "react";
import {
  Column,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  // Table,
  useReactTable,
} from "@tanstack/react-table";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "../table";

// declare module "@tanstack/react-table" {
//   interface TableMeta<TData extends RowData> {
//     updateData: (rowIndex: number, columnId: string, value: unknown) => void;
//   }
// }

// TODO:
// [x] editable
export type TanstackTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
};
export const TanstackTable = <TData extends RowData = RowData>({
  columns: propColumns,
  data,
}: TanstackTableProps<TData>) => {
  const columns = useMemo<ColumnDef<TData>[]>(() => propColumns, [propColumns]);
  const table = useReactTable({
    data,
    columns,
    // defaultColumn,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <TableRoot>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                    <div>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => {
          return (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </TableBody>
    </TableRoot>
  );
};

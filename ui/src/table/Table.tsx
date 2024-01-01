"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ForwardedRef, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
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
  const [selectedRows, setSelectedRows] = useState<TRecord[]>([]);
  const [rowSelection, setRowSelection] = useState({});

  const columnsDef: ColumnDef<TRecord>[] = columns.map(
    ({ dataIndex, title, render }, index) => {
      const columnDefMerged: ColumnDef<TRecord> = {
        id: dataIndex?.toString() ?? index.toString(),
        accessorKey: dataIndex,
        header: () => title,
      };
      // if (dataIndex) {
      //   columnDefMerged.accessorKey = dataIndex
      // }
      if (render) {
        columnDefMerged.cell = ({ row }) =>
          typeof dataIndex === "string"
            ? render(row.getValue(dataIndex), row.original, row.index)
            : render(undefined as never, row.original, row.index);
      }
      return columnDefMerged;
      // return {
      //   ...(dataIndex && { accessorKey: dataIndex }),
      //   // accessorKey: "123",
      //   header: () => title,
      //   ...(render !== undefined
      //     ? {
      //         cell: ({ row }) =>
      //           typeof dataIndex === "string"
      //             ? render(row.getValue(dataIndex), row.original, row.index)
      //             : undefined,
      //       }
      //     : {}),
      // };
    },
  );
  const table = useReactTable({
    data: dataSource,
    columns: columnsDef,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
  });

  // const mergedColumns = [
  //   // show arrow
  //   ...(expandable
  //     ? ([
  //         {
  //           width: 30,
  //           render: (record, index) => (
  //             <Disclosure.Button
  //               className="tw-text-sm tw-font-medium tw-text-purple-500 tw-cursor-pointer tw-bg-white"
  //               onClick={() => {
  //                 expandable.onExpand?.(record);
  //               }}
  //             >
  //               <ChevronUpIcon
  //                 className={`tw-h-5 tw-w-5 tw-transition-transform ${
  //                   (
  //                     rowKey
  //                       ? expandable.expandedRowKeys?.includes(
  //                           String(record[rowKey]),
  //                         )
  //                       : expandable.expandedRowKeys?.includes(index.toString())
  //                   )
  //                     ? "tw-transform tw-rotate-0"
  //                     : "tw-rotate-180"
  //                 }`}
  //                 aria-hidden="true"
  //               />
  //             </Disclosure.Button>
  //           ),
  //         },
  //       ] as ColumnsType<RecordType>)
  //     : []),
  //   // Checkbox column
  //   ...(rowSelection
  //     ? ([
  //         {
  //           title: (
  //             <Checkbox
  //               checked={
  //                 _.isEqual(
  //                   dataSource?.map((data) => {
  //                     return data.id;
  //                   }),
  //                   rowSelection.selectedRowKeys,
  //                 ) &&
  //                 dataSource &&
  //                 dataSource.length > 0
  //               }
  //               className="cursor-pointer"
  //               onChange={(e) => {
  //                 if (e.currentTarget.checked) {
  //                   if (rowSelection.selectedRowKeys) {
  //                     const newSelectedRows = [
  //                       ...selectedRows,
  //                       ...(dataSource ?? []),
  //                     ];
  //                     const newSelectedRowKeys = newSelectedRows.map(
  //                       (data) => data[rowKey],
  //                     ) as Key[];
  //                     setSelectedRows(newSelectedRows);
  //                     rowSelection.onChange(
  //                       newSelectedRowKeys,
  //                       newSelectedRows,
  //                     );
  //                   }
  //                 } else {
  //                   if (rowSelection.selectedRowKeys) {
  //                     setSelectedRows([]);
  //                     rowSelection.onChange([], []);
  //                   }
  //                 }
  //               }}
  //             />
  //           ),
  //           width: 30,
  //           render: (record) => {
  //             return (
  //               <Checkbox
  //                 checked={rowSelection?.selectedRowKeys?.includes(
  //                   record[rowKey] as Key,
  //                 )}
  //                 className="cursor-pointer"
  //                 onChange={(e) => {
  //                   if (e.currentTarget.checked) {
  //                     if (rowSelection.selectedRowKeys && record[rowKey]) {
  //                       const newSelectedRows = [...selectedRows, record];
  //                       const newSelectedRowKeys = newSelectedRows.map(
  //                         (data) => data[rowKey],
  //                       ) as Key[];
  //                       setSelectedRows(newSelectedRows);
  //                       rowSelection.onChange(
  //                         newSelectedRowKeys,
  //                         newSelectedRows,
  //                       );
  //                     }
  //                   } else {
  //                     if (rowSelection.selectedRowKeys && record[rowKey]) {
  //                       const newSelectedRows = selectedRows.filter(
  //                         (data) => data[rowKey] !== record[rowKey],
  //                       );
  //                       const newSelectedRowKeys = newSelectedRows.map(
  //                         (data) => data[rowKey],
  //                       ) as Key[];
  //                       setSelectedRows(newSelectedRows);
  //                       rowSelection.onChange(
  //                         newSelectedRowKeys,
  //                         newSelectedRows,
  //                       );
  //                     }
  //                   }
  //                 }}
  //               />
  //             );
  //           },
  //         },
  //       ] as ColumnsType<RecordType>)
  //     : []),
  //   // Filter hidden column
  //   ...columns.filter((x) => !x.hidden),
  // ];

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
        {...props}
      >
        {/* {mergedColumns.some(column => column.width) && ( */}
        {/*   <colgroup> */}
        {/*     {mergedColumns.map(({ width }, idx) => ( */}
        {/*       <col key={idx} {...(width ? { style: { width: width } } : {})} /> */}
        {/*     ))} */}
        {/*   </colgroup> */}
        {/* )} */}
        <TableHeader className={clsm("", sticky ? "tw-sticky tw-top-0" : "")}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
          {/* <tr> */}
          {/*   {mergedColumns.map(({ title, align, className = "" }, idx) => ( */}
          {/*     <TableHead */}
          {/*       key={idx} */}
          {/*       scope="col" */}
          {/*       className={clsm( */}
          {/*         className, */}
          {/*         align === "center" ? "tw-text-center" : "", */}
          {/*         align === "right" ? "tw-text-right" : "", */}
          {/*         "tw-text-gray-900", */}
          {/*         "tw-text-left tw-text-xs tw-font-semibold", */}
          {/*         "tw-bg-gray-50 tw-border-b tw-border-solid", */}
          {/*         bordered */}
          {/*           ? "tw-border-r last:tw-border-r-0 tw-border-neutral-40 first:tw-rounded-tl-xl last:tw-rounded-tr-xl" */}
          {/*           : "tw-border-line", */}
          {/*         !size || size === "default" ? "tw-py-3.5 tw-px-2" : "", */}
          {/*         size === "smal" ? "tw-p-2" : "", */}
          {/*         headerClassName */}
          {/*       )} */}
          {/*     > */}
          {/*       {title} */}
          {/*     </TableHead> */}
          {/*   ))} */}
          {/* </tr> */}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
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

          {/* {dataSource && dataSource.length > 0 ? ( */}
          {/*   dataSource.map((record, index) => ( */}
          {/*     <Disclosure key={`${rowKey ? record[rowKey] : index}`}> */}
          {/*       <tr> */}
          {/*         {mergedColumns.map((column, idx) => ( */}
          {/*           <td */}
          {/*             key={idx} */}
          {/*             className={classNames( */}
          {/*               column.align === "center" ? "tw-text-center" : "", */}
          {/*               column.align === "right" ? "tw-text-right" : "", */}
          {/*               "tw-text-sm tw-text-[#000000DE]", */}
          {/*               bordered && index === dataSource.length - 1 ? "" : "tw-border-b", */}
          {/*               bordered */}
          {/*                 ? "tw-border-r last:tw-border-r-0 tw-border-neutral-40" */}
          {/*                 : "tw-border-line", */}
          {/*               !size || size === "default" ? "tw-py-4 tw-px-2" : "", */}
          {/*               size === "smal" ? "tw-p-2" : "", */}
          {/*               rowClassName */}
          {/*             )} */}
          {/*           > */}
          {/*             {column.render ? ( */}
          {/*               column.render(record, index) */}
          {/*             ) : column.dataIndex ? ( */}
          {/*               <>{record[column.dataIndex] || "-"}</> */}
          {/*             ) : null} */}
          {/*           </td> */}
          {/*         ))} */}
          {/*       </tr> */}
          {/*       <Transition */}
          {/*         as="tr" */}
          {/*         show={ */}
          {/*           expandable && */}
          {/*           (rowKey */}
          {/*             ? expandable.expandedRowKeys?.includes(String(record[rowKey])) */}
          {/*             : expandable.expandedRowKeys?.includes(index.toString())) */}
          {/*         } */}
          {/*       > */}
          {/*         <Disclosure.Panel */}
          {/*           as="td" */}
          {/*           colSpan={mergedColumns.length} */}
          {/*           className={classNames( */}
          {/*             "tw-border-b tw-border-line", */}
          {/*             !size || size === "default" ? "tw-py-4 tw-px-2" : "", */}
          {/*             expandable?.expandedRowClassName || "" */}
          {/*           )} */}
          {/*         > */}
          {/*           {expandable?.expandedRowRender(record)} */}
          {/*         </Disclosure.Panel> */}
          {/*       </Transition> */}
          {/*     </Disclosure> */}
          {/*   )) */}
          {/* ) : ( */}
          {/*   <tr> */}
          {/*     <td className="tw-text-center tw-h-40" colSpan={mergedColumns.length}> */}
          {/*       <Empty {...emptyRender} /> */}
          {/*     </td> */}
          {/*   </tr> */}
          {/* )} */}
        </TableBody>
      </table>
      {/* {pagination && <BPPaginationWithState {...pagination} />} */}
    </div>
  );
  return (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={clsm("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
};

const Table = forwardRef(TableInner) as <T extends Record<string, unknown>>(
  props: TableProps<T> & { ref?: ForwardedRef<HTMLUListElement> },
) => ReturnType<typeof TableInner>;

export { Table };

export type { TableProps };

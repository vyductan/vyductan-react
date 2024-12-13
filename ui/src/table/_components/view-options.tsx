"use client";

import type { Table } from "@tanstack/react-table";

import { Button } from "../../button";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../dropdown";
import { Icon } from "../../icons";

interface TableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function TableViewOptions<TData>({
  table,
}: TableViewOptionsProps<TData>) {
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto flex h-8 self-start"
          icon={<Icon icon="icon-[radix-icons--mixer-horizontal]" />}
        >
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) => column.accessorFn !== undefined && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {/* {column.id} */}
                {column.columnDef.meta?.title}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

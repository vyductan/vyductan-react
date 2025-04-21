// https://github.com/sadmann7/shadcn-table/blob/main/src/components/data-table/data-table-view-options.tsx
// Nov 14, 2024
"use client";

import type { Table } from "@tanstack/react-table";
import React from "react";

import type { PopoverProps } from "../../popover";
import { cn } from "../..";
import { Button } from "../../button";
import { Command } from "../../command";
import { Icon } from "../../icons";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "../../popover";

type TableViewOptionsProps<TData> = PopoverProps & {
  table: Table<TData>;
};

export function TableViewOptions<TData>({
  table,
  className,
}: TableViewOptionsProps<TData>) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <PopoverRoot modal>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          aria-label="Toggle columns"
          role="combobox"
          variant="outline"
          className={cn("ml-auto hidden md:flex", className)}
          icon={<Icon icon="icon-[lucide--settings-2]" />}
        >
          View
          <Icon
            icon="icon-[lucide--chevrons-up-down]"
            className="ml-auto shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-44 p-0"
        onCloseAutoFocus={() => triggerRef.current?.focus()}
      >
        <Command
          mode="multiple"
          placeholder="Search columns..."
          options={table
            .getAllColumns()
            .filter(
              (column) =>
                column.accessorFn !== undefined && column.getCanHide(),
            )
            .map((column) => ({
              label: column.columnDef.meta?.title
                ? typeof column.columnDef.meta.title === "function"
                  ? column.columnDef.meta.title({ table })
                  : column.columnDef.meta.title
                : column.id,
              value: column.id,
              checked: column.getIsVisible(),
              className: "truncate",
              onSelect: () => column.toggleVisibility(!column.getIsVisible()),
            }))}
        />
      </PopoverContent>
    </PopoverRoot>
  );
}

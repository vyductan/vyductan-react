"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import type { TableHeadProps } from ".";
import type { tableLocale_en } from "../locale/en-us";
import { TableHead } from ".";
import { cn } from "../..";
import { Tooltip } from "../../tooltip";

interface TableHeadAdvancedProps<TData, TValue> extends TableHeadProps {
  column: Column<TData, TValue>;
  locale: Partial<Record<keyof typeof tableLocale_en.Table, React.ReactNode>>;
}

export function TableHeadAdvanced<TData, TValue>({
  column,
  children,
  className,
  locale,
  ...props
}: TableHeadAdvancedProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <TableHead className={cn(className)} {...props}>
        {children}
      </TableHead>
    );
  }

  return (
    <TableHead
      className={cn("px-0", className)}
      aria-label={
        column.getIsSorted() === "desc"
          ? "Sorted descending. Click to sort ascending."
          : column.getIsSorted() === "asc"
            ? "Sorted ascending. Click to sort descending."
            : "Not sorted. Click to sort ascending."
      }
      {...props}
    >
      <Tooltip
        title={
          column.getCanSort()
            ? column.getNextSortingOrder() === "asc"
              ? locale.triggerAsc
              : column.getNextSortingOrder() === "desc"
                ? locale.triggerDesc
                : locale.cancelSort
            : undefined
        }
        delayDuration={200}
      >
        <div
          className={cn(
            "-my-2 p-2",
            "flex w-full items-center justify-between",
            "cursor-pointer rounded-md border-none hover:bg-accent hover:text-accent-foreground",
          )}
          onClick={column.getToggleSortingHandler()}
        >
          {children}
          {column.getCanSort() && column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2.5 size-4" aria-hidden="true" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2.5 size-4" aria-hidden="true" />
          ) : (
            <ChevronsUpDown className="ml-2.5 size-4" aria-hidden="true" />
          )}
        </div>
      </Tooltip>
    </TableHead>
  );
}

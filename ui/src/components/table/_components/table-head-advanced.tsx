"use client";

import type { Column } from "@tanstack/react-table";

import { cn } from "@acme/ui/lib/utils";

import type { TableHeadProps } from ".";
import type { TableLocale } from "../types";
import { TableHead } from ".";
import { Icon } from "../../../icons";
import { Tooltip } from "../../tooltip";

interface TableHeadAdvancedProps<TData, TValue> extends TableHeadProps {
  column: Column<TData, TValue>;
  locale: TableLocale;
}

export function TableHeadAdvanced<TData, TValue>({
  column,
  children,

  align,
  size,
  className,

  locale,

  onClick: originOnClick,
  ...props
}: TableHeadAdvancedProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <TableHead size={size} className={cn(className)} {...props}>
        {children}
      </TableHead>
    );
  }
  // const originOnClick = cell.onClick;

  const onClick = (event: React.MouseEvent<HTMLTableHeaderCellElement>) => {
    column.columnDef.meta?.onHeaderCell?.(column.columnDef.meta);
    originOnClick?.(event);
  };

  return (
    <TableHead
      size={size}
      className={cn("px-1", className)}
      aria-label={
        column.getIsSorted() === "desc"
          ? "Sorted descending. Click to sort ascending."
          : column.getIsSorted() === "asc"
            ? "Sorted ascending. Click to sort descending."
            : "Not sorted. Click to sort ascending."
      }
      onClick={onClick}
      {...props}
      {...column.columnDef.meta?.onHeaderCell?.(column.columnDef.meta)}
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
            size === "small" && "p-1",
            "flex w-full items-center justify-between",
            "hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md border-none",
          )}
          onClick={column.getToggleSortingHandler()}
        >
          {align === "center" && <span className="mr-2.5 size-4"></span>}
          <span className="flex-1">{children}</span>
          {column.getCanSort() && column.getIsSorted() === "desc" ? (
            <Icon
              icon="icon-[lucide--arrow-down]"
              className="ml-2.5 size-4"
              aria-hidden="true"
            />
          ) : column.getIsSorted() === "asc" ? (
            <Icon
              icon="icon-[lucide--arrow-up]"
              className="ml-2.5 size-4"
              aria-hidden="true"
            />
          ) : (
            <Icon
              icon="icon-[lucide--chevrons-up-down]"
              className="ml-2.5 size-4"
              aria-hidden="true"
            />
          )}
        </div>
      </Tooltip>
    </TableHead>
  );
}

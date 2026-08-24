"use client";

import type { Column } from "@tanstack/react-table";

import type { TableLocale } from "../types";
import type { TableHeadProps } from "./base";
import { Icon } from "../../../icons";
import { cn } from "../../../lib/utils";
import { Tooltip } from "../../tooltip";
import { TableHead, tableSorterBoxClass } from "./base";

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

  const nextSortOrder = column.getNextSortingOrder();
  const ariaLabel = column.getIsSorted()
    ? `Sorted ${column.getIsSorted() === "asc" ? "ascending" : "descending"}. Click to ${
        nextSortOrder === "asc"
          ? "sort ascending"
          : nextSortOrder === "desc"
            ? "sort descending"
            : "cancel sort"
      }.`
    : `Not sorted. Click to sort ${nextSortOrder === "asc" ? "ascending" : "descending"}.`;

  // Always trails the label; body cells compensate with a right gutter.
  const sortIcon = (
    <Icon
      icon={
        column.getIsSorted() === "desc"
          ? "icon-[lucide--arrow-down]"
          : column.getIsSorted() === "asc"
            ? "icon-[lucide--arrow-up]"
            : "icon-[lucide--chevrons-up-down]"
      }
      className="ml-1 size-4"
      aria-hidden="true"
    />
  );

  return (
    <TableHead
      size={size}
      className={cn("px-1", className)}
      aria-label={ariaLabel}
      onClick={onClick}
      {...props}
      {...column.columnDef.meta?.onHeaderCell?.(column.columnDef.meta)}
    >
      <Tooltip
        title={
          column.getCanSort()
            ? nextSortOrder === "asc"
              ? locale.triggerAsc
              : nextSortOrder === "desc"
                ? locale.triggerDesc
                : locale.cancelSort
            : undefined
        }
        delayDuration={200}
      >
        <div
          className={cn(
            tableSorterBoxClass(size),
            "flex w-full items-center justify-between",
            "hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md border-none",
          )}
          onClick={column.getToggleSortingHandler()}
        >
          {/*
            The icon always trails the label (matching Ant Design). It therefore
            consumes width at the cell's right edge, which is why right-aligned
            columns give their BODY cells a matching right gutter — see
            SORTER_GUTTER_CLASS in base.tsx — so the values line up under the
            label instead of under the icon. `center` gets a counterweight spacer
            for the same reason.
          */}
          {align === "center" && <span className="mr-1 size-4"></span>}
          <span className="flex-1">{children}</span>
          {sortIcon}
        </div>
      </Tooltip>
    </TableHead>
  );
}

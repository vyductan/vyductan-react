import type * as React from "react";

import { cn } from "@acme/ui/lib/utils";
import {
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableCell as ShadcnTableCell,
  TableFooter as ShadcnTableFooter,
  TableHead as ShadcnTableHead,
  TableHeader as ShadcnTableHeader,
  TableRow as ShadcnTableRow,
} from "@acme/ui/shadcn/table";

import type { SizeType } from "../../config-provider/size-context";
import type { OwnTableProps } from "../table";

function TableRoot({
  className,
  bordered,
  ...props
}: React.ComponentProps<"table"> & { bordered?: OwnTableProps["bordered"] }) {
  return (
    <ShadcnTable
      className={cn(
        "border-separate border-spacing-0",
        bordered && cn(["rounded-md border border-b-0"]),
        className,
      )}
      {...props}
    />
  );
}

type TableHeaderProps = React.ComponentProps<"thead"> & {
  /** Set sticky header and scroll bar */
  sticky?:
    | boolean
    | {
        offsetHeader?: number;
        offsetScroll?: number;
        getContainer?: () => HTMLElement;
      };
};
function TableHeader({ className, sticky, ...props }: TableHeaderProps) {
  return (
    <ShadcnTableHeader
      className={cn(
        // "[&_tr]:border-b",
        className,
      )}
      style={{
        position: sticky ? "sticky" : undefined,
        top: sticky
          ? typeof sticky === "boolean"
            ? 0
            : sticky.offsetHeader
          : undefined,
        zIndex: sticky ? 11 : undefined,
      }}
      {...props}
    />
  );
}

type TableBodyProps = React.ComponentProps<"tbody">;
function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <ShadcnTableBody
      className={cn(
        // "[&_tr:last-child]:border-0",
        // own
        // "[&_tr:last-child>td]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <ShadcnTableFooter
      className={cn(
        // "[&_tr:last-child>td]:border-b-0",
        // "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

type TableRowProps = React.ComponentProps<"tr">;
function TableRow({ className, ...props }: TableRowProps) {
  return (
    <ShadcnTableRow
      className={cn(
        // "hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors",
        // "border-b",
        className,
      )}
      {...props}
    />
  );
}

type TableWrapperHeaderProps = React.ComponentProps<"div"> & {
  bordered?: OwnTableProps["bordered"];
  size?: SizeType;
};
const TableWrapperHeader = ({
  className,
  bordered,
  size,
  ...props
}: TableWrapperHeaderProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        "p-3",
        size === "small" && "p-2 leading-[22px]",
        bordered ? "rounded-t-md border-x border-t" : "mb-1",
        className,
      )}
      {...props}
    />
  );
};

type TableWrapperFooterProps = React.ComponentProps<"div"> & {
  bordered?: OwnTableProps["bordered"];
  size?: SizeType;
};
const TableWrapperFooter = ({
  className,
  bordered,
  size,
  ...props
}: TableWrapperFooterProps) => {
  return (
    <div
      className={cn(
        "bg-muted/50",
        "p-3",
        size === "small" && "p-2 leading-[22px]",
        bordered ? "rounded-b-md border-x border-b" : "mb-1",
        className,
      )}
      {...props}
    />
  );
};

type TableHeadProps = React.ComponentProps<"th"> & {
  size?: SizeType;
};
function TableHead({ className, size, ...props }: TableHeadProps) {
  return (
    <ShadcnTableHead
      // data-slot="table-head"
      className={cn(
        // "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        // own
        "h-auto p-3 whitespace-normal",
        size === "small" && "p-2 leading-[22px]",
        // "break-words",
        // "first:rounded-tl-md last:rounded-tr-md",
        "border-b",
        className,
      )}
      {...props}
    />
  );
}

type TableCellProps = React.ComponentProps<"td"> & {
  size?: SizeType;
};
function TableCell({ className, size, ...props }: TableCellProps) {
  return (
    <ShadcnTableCell
      // data-slot="table-cell"
      className={cn(
        // "align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        // 'whitespace-nowrap',
        // "p-2",
        // own
        "p-3",
        size === "small" && "p-2 leading-[22px]",
        // "break-words",
        // "group-hover:bg-background-hover",
        "border-b",
        className,
      )}
      {...props}
    />
  );
}

export type { TableHeaderProps, TableBodyProps, TableRowProps, TableHeadProps };

export {
  TableWrapperHeader,
  TableWrapperFooter,
  TableRoot,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
};

export { TableCaption } from "@acme/ui/shadcn/table";

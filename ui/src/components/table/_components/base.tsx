import * as React from "react";

import { cn } from "@acme/ui/lib/utils";

import type { SizeType } from "../../config-provider/size-context";
import type { OwnTableProps } from "../table";

function TableRoot({
  className,
  bordered,
  ...props
}: React.ComponentProps<"table"> & { bordered?: OwnTableProps["bordered"] }) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom text-sm",
          bordered && cn(["border-spacing-0 rounded-md border"]),
          className,
        )}
        {...props}
      />
    </div>
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
    <thead
      data-slot="table-header"
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
    <tbody
      data-slot="table-body"
      className={cn(
        // "[&_tr:last-child]:border-0",
        // own
        "[&_tr:last-child>td]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

type TableRowProps = React.ComponentProps<"tr">;
function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors",
        // "border-b",
        className,
      )}
      {...props}
    />
  );
}

type TableHeadProps = React.ComponentProps<"th"> & {
  size?: SizeType;
};
function TableHead({ className, size, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
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
    <td
      data-slot="table-cell"
      className={cn(
        "align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
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

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export type { TableHeaderProps, TableBodyProps, TableRowProps, TableHeadProps };

export {
  TableRoot,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

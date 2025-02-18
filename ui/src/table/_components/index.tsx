import * as React from "react";

import type { TableSize } from "../types";
import { cn } from "../..";

function TableRoot({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
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

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      // "[&_tr:last-child]:border-0",
      "[&_tr:last-child>td]:border-b-0",
      className,
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;
const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "transition-colors",
        // "border-b",
        "hover:bg-muted/50",
        "data-[state=selected]:bg-muted",
        // "group",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  size?: TableSize;
};
const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, size, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        // "h-10 px-2",
        "text-muted-foreground text-left align-middle font-medium",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",

        "p-3",
        size === "sm" && "p-2 leading-[22px]",
        // "break-words",
        // "first:rounded-tl-md last:rounded-tr-md",
        "border-b",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  size?: TableSize;
};
const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, size, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        // "p-2",
        "align-middle",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",

        "p-3",
        size === "sm" && "p-2 leading-[22px]",
        // "break-words",
        // "group-hover:bg-background-hover",
        "border-b",
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("text-muted-foreground mt-4 text-sm", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export type { TableRowProps, TableHeadProps };

export {
  TableRoot,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

export * from "./view-options";
export * from "./table-footer";
export * from "./table-summary";
export * from "./table-summary-row";
export * from "./table-summary-cell";
export * from "./table-toolbar-root";
export * from "./table-toolbar-left";
export * from "./table-toolbar-right";

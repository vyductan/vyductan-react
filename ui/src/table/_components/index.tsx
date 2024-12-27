import * as React from "react";

import type { TableSize } from "../types";
import { cn } from "../..";

const TableRoot = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <>
    <table
      ref={ref}
      className={cn(
        // "w-full",
        "caption-bottom text-sm",
        className,
      )}
      {...props}
    />
  </>
));
TableRoot.displayName = "TableRoot";

type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  /** Set sticky header and scroll bar */
  sticky?:
    | boolean
    | {
        offsetHeader?: number;
        offsetScroll?: number;
        getContainer?: () => HTMLElement;
      };
};
const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, sticky, ...props }, ref) => (
    <thead
      ref={ref}
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
  ),
);
TableHeader.displayName = "TableHeader";

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
        "px-2",
        size === "sm" ? "py-2" : "py-3",
        "text-left align-middle font-medium text-muted-foreground",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
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
        "px-2",
        size === "sm" ? "py-2" : "py-3",
        "align-middle",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
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
    className={cn("mt-4 text-sm text-muted-foreground", className)}
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

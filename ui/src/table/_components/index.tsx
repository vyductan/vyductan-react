import * as React from "react";

import type { TableProps } from "../table";
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
      className={cn("[&_tr]:border-b", className)}
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
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;
const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors",
        "hover:bg-muted/50 data-[state=selected]:bg-muted",
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
} & Pick<TableProps, "bordered">;
const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, size, bordered, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "px-2",
        size === "sm" ? "py-2" : "py-3",
        "text-left align-middle font-medium text-muted-foreground",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        // "break-words",
        // "first:rounded-tl-md last:rounded-tr-md",
        bordered && "border-b border-e last:border-e-0",
        !bordered &&
          "before:absolute before:right-0 before:top-1/2 before:h-[1.6em] before:w-px before:-translate-y-1/2 before:bg-accent before:content-[''] last:before:bg-transparent",

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
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

export * from "./view-options";

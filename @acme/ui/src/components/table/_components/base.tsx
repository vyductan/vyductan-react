import type * as React from "react";

import type { SizeType } from "../../config-provider/size-context";
import type { OwnTableProps } from "../table";
import { cn } from "../../../lib/utils";
import {
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableCell as ShadcnTableCell,
  TableFooter as ShadcnTableFooter,
  TableHead as ShadcnTableHead,
  TableHeader as ShadcnTableHeader,
  TableRow as ShadcnTableRow,
} from "../../../shadcn/table";

/**
 * A `size` is a TIER on the shared small|middle|large scale, but each component
 * family decides WHAT the tier controls. The input family maps it to control
 * HEIGHT (`h-6`/`h-8`/`h-10`, see `input/variants.ts`); a table cell has no
 * height of its own — it grows with content — so the table maps it to cell
 * PADDING instead. Same labels, different invariant: do NOT derive these maps
 * from the input family's.
 *
 * `middle` is the default tier: `size` undefined resolves here. That diverges
 * from Ant Design, whose Table defaults to `large`.
 *
 * Values track Ant Design's Table padding tokens (`cellPaddingBlock` 16 /
 * `...MD` 12 / `...SM` 8) with one deliberate divergence: `middle` keeps a
 * symmetric 12px rather than AntD's 12/8, so the existing default rendering
 * does not shift. See `docs/adr/0001-table-size-tiers.md`.
 */
const CELL_PADDING_CLASS = {
  small: "p-2", // 8px
  middle: "p-3", // 12px
  large: "p-4", // 16px
} as const;

/**
 * Right padding for the BODY cells of a right-aligned sortable column, so the
 * values line up under the header LABEL instead of under the trailing sorter
 * icon (which matches Ant Design's icon placement).
 *
 * The number restates the cell's own padding because Tailwind cannot ADD
 * padding — `pr-*` REPLACES the base `p-*` from CELL_PADDING_CLASS. So each
 * entry is that tier's padding + the icon's `size-4` (16px) + its `ml-1` (4px)
 * in table-head-advanced.tsx (4px is Ant Design's marginXXS). Verified against
 * the rendered layout, not just arithmetic. Keep in step with
 * CELL_PADDING_CLASS and the icon's size/margin.
 */
const SORTER_GUTTER_CLASS = {
  small: "pr-[28px]", // 8 + 20
  middle: "pr-[32px]", // 12 + 20
  large: "pr-[36px]", // 16 + 20
} as const;

/**
 * The sortable header's clickable/hover box. Its padding widens the hit area
 * and its negative margin pulls the same amount back, so a sortable header
 * ends up exactly as tall as a plain one. The two halves MUST match per tier —
 * a fixed `-my-2` against a per-tier padding is what made small headers 4px
 * short.
 */
const SORTER_BOX_CLASS = {
  small: "-my-1 p-1",
  middle: "-my-2 p-2",
  large: "-my-3 p-3",
} as const;

/** `size` undefined means the `middle` tier. */
const resolveSizeTier = (size: SizeType) => size ?? "middle";

const tableCellPaddingClass = (size: SizeType) =>
  CELL_PADDING_CLASS[resolveSizeTier(size)];

const tableSorterGutterClass = (size: SizeType) =>
  SORTER_GUTTER_CLASS[resolveSizeTier(size)];

const tableSorterBoxClass = (size: SizeType) =>
  SORTER_BOX_CLASS[resolveSizeTier(size)];

/**
 * Ant Design's `lineHeight` is uniform across Table sizes; this restates the
 * repo's `--line-height` token (22px) because shadcn's `<table>` carries
 * `text-sm`, whose Tailwind line-height is 20px. It is NOT keyed to `size`.
 */
const CELL_LEADING_CLASS = "leading-[22px]";

function TableRoot({
  className,
  bordered,
  stickyHeader,
  ...props
}: React.ComponentProps<"table"> & {
  bordered?: OwnTableProps["bordered"];
  /**
   * Whether this table renders a `position: sticky` header — see the note on
   * the neutralising class below. Mirrors table.tsx's `sticky || scroll?.y`.
   */
  stickyHeader?: boolean;
}) {
  return (
    <div
      data-slot="table-root"
      className={cn(
        "relative w-full",
        /**
         * shadcn's `<Table>` hard-codes its own `overflow-x-auto` wrapper div
         * around the `<table>`, and it takes no className, so it can only be
         * neutralised from here. `overflow-x: auto` also drags `overflow-y` to
         * `auto` (a `visible` axis computes to `auto` when the other axis is
         * not `visible`), which makes that wrapper the nearest SCROLLPORT for
         * the header. `position: sticky` then measures against a box with no
         * scroll range of its own, so the header simply scrolls away instead of
         * sticking — whether the real scrollport is the window or this table's
         * own `scroll.y` container.
         *
         * Only neutralise it when a sticky header is actually wanted: for every
         * other table that wrapper is the one thing that keeps an over-wide
         * table scrollable (a long unbreakable cell value can push the table
         * past its container even with no `scroll.x`) rather than spilling out.
         *
         * This does not rescue every sticky table. A horizontal scrollport is
         * a port on BOTH axes for the same reason, so where the header's
         * nearest port has no vertical range of its own the header still
         * cannot stick:
         *
         *   `sticky` alone                  -> works (port: the window)
         *   `scroll.y` (± `scroll.x`)       -> works (port: the outer wrapper,
         *                                      which owns the vertical scroll)
         *   `sticky` + `scroll.x`, no `y`   -> still broken; the outer wrapper
         *                                      is `overflow-y-hidden`, so the
         *                                      header resolves against a box
         *                                      with no range while the PAGE
         *                                      scrolls behind it
         *
         * Fixing that last pair needs Ant Design's approach — a cloned header
         * rendered outside the scroll container — which this table does not
         * implement.
         */
        stickyHeader && "[&>[data-slot=table-container]]:overflow-visible",
      )}
    >
      <ShadcnTable
        className={cn(
          "border-separate border-spacing-0",
          bordered && cn(["rounded-md border"]),
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
      data-slot="table-summary"
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
        CELL_LEADING_CLASS,
        tableCellPaddingClass(size),
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
      data-slot="table-footer"
      className={cn(
        "bg-muted/50",
        CELL_LEADING_CLASS,
        tableCellPaddingClass(size),
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
        // "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-[2px]",
        // own
        "h-auto whitespace-normal",
        CELL_LEADING_CLASS,
        tableCellPaddingClass(size),
        // "wrap-break-word",
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
        // "align-middle has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-[2px]",
        // 'whitespace-nowrap',
        // "p-2",
        // own
        "whitespace-normal",
        CELL_LEADING_CLASS,
        tableCellPaddingClass(size),
        // "wrap-break-word",
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
  tableCellPaddingClass,
  tableSorterGutterClass,
  tableSorterBoxClass,
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

export { TableCaption } from "../../../shadcn/table";

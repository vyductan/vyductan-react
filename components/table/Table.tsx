import { forwardRef } from "react";
import type {
  ForwardedRef,
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
} from "react";

import { clsm } from "@vyductan/utils";

import type { ColumnDef } from "./types";

type TableProps<TRecord> = HTMLAttributes<HTMLTableElement> & {
  columns: ColumnDef<TRecord>[];
  dataSource?: TRecord[];
  bordered?: boolean;
  // emptyRender?: EmptyProps;
  expandable?: {
    expandedRowKeys: string[];
    expandedRowRender: (record: TRecord) => ReactNode;
    rowExpandable?: (record: TRecord) => boolean;
    onExpand?: (record: TRecord) => void;
  };
  rowKey?: keyof TRecord;
  loading?: boolean;
  // pagination?: BPPaginationWithStateProps;
  sticky?: boolean;
  size?: "smal" | "default";
};

const Table = forwardRef<HTMLTableElement, TableProps<Record<string, unknown>>>(
  <TRecord extends Record<string, unknown>>(
    { className, ...props }: TableProps<TRecord>,
    ref: ForwardedRef<HTMLTableElement>,
  ) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={clsm("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

export { Table };

export type { TableProps };

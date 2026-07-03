import type { XOR } from "ts-xor";

import type { AnyObject } from "../_util/type";
import type { OwnTableProps, RecordWithCustomRow } from "./table";
import type { Key } from "./types";
import { TableRoot } from "./_components/base";
import { OwnTable } from "./table";

type ShadcnTableProps = React.ComponentProps<typeof TableRoot>;

type XORTableProps<
  TRecord extends RecordWithCustomRow = AnyObject,
  TKey extends Key = Key,
> = XOR<ShadcnTableProps, OwnTableProps<TRecord, TKey>>;

const Table = <
  TRecord extends RecordWithCustomRow = AnyObject,
  TKey extends Key = Key,
>(
  props: XORTableProps<TRecord, TKey>,
) => {
  const isShadcnTable = !props.columns;
  if (isShadcnTable) {
    return <TableRoot {...(props as ShadcnTableProps)} />;
  }
  return <OwnTable {...props} />;
};

export type { XORTableProps as TableProps };
export type {
  ColumnGroupType as TableColumnGroupType,
  ColumnsType as TableColumnsType,
  ColumnType as TableColumnType,
  TablePaginationConfig,
} from "./types";
export { Table };

export {
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./_components/base";
export {
  DragHandle,
  TableRowSortable,
  TableSummary,
  TableSummaryCell,
  TableSummaryRow,
  TableToolbarLeft,
  TableToolbarRight,
  TableToolbarRoot,
  TableViewOptions,
} from "./_components";

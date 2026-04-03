import type { XOR } from "ts-xor";

import type { AnyObject } from "../_util/type";
import type { OwnTableProps, RecordWithCustomRow } from "./table";
import { TableRoot } from "./_components/base";
import { OwnTable } from "./table";

type ShadcnTableProps = React.ComponentProps<typeof TableRoot>;

type XORTableProps<TRecord extends RecordWithCustomRow = AnyObject> = XOR<
  ShadcnTableProps,
  OwnTableProps<TRecord>
>;

const Table = <TRecord extends RecordWithCustomRow = AnyObject>(
  props: XORTableProps<TRecord>,
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

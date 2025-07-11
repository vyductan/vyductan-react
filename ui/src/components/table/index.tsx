import type { XOR } from "ts-xor";

import type { AnyObject } from "../_util/type";
import type { OwnTableProps, RecordWithCustomRow } from "./table";
import { TableRoot } from "./_components";
import { OwnTable } from "./table";

export * from "./table";
export * from "./types";
export * from "./locale/en-us";
export * from "./locale/vi-vn";
export * from "./_components";

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
export { Table };

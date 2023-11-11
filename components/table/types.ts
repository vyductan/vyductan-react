import type { ReactNode } from "react";

export type ColumnDef<TRecord> = {
  dataIndex?: keyof TRecord;
  title?: string | ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  hidden?: boolean;
  width?: number | string;
  render?: (record: TRecord, index: number) => ReactNode;
};

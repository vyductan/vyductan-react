import type { ReactNode } from "react";

/**
 * TRecord[K] inherit from https://stackoverflow.com/a/56837244
 */
type BaseTableColumnDef = {
  title?: string | ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  hidden?: boolean;
  width?: number | string;
};
type DefWithOutDataIndex<TRecord> = BaseTableColumnDef & {
  dataIndex?: never;
  // x: (x: TRecord) => ReactNode;
  render?: (value: never, record: TRecord, index: number) => ReactNode;
};
export type TableColumnDef<TRecord> =
  | DefWithOutDataIndex<TRecord>
  | (BaseTableColumnDef &
      {
        [K in keyof TRecord]-?: {
          dataIndex: K;
          render?: (
            value: TRecord[K],
            record: TRecord,
            index: number,
          ) => ReactNode;
        };
      }[keyof TRecord]);

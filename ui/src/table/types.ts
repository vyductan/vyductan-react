import type { Column, Row } from "@tanstack/react-table";
import type { ReactNode } from "react";

/**
 * TRecord[K] inherit from https://stackoverflow.com/a/56837244
 */
type BaseTableColumnDef = {
  title?: string | ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  hidden?: boolean;
  width?: number;

  enableResizing?: boolean;
  minWidth?: number;
};
export type ExtraTableColumnDef<TRecord> = {
  fixed?: "left" | "right";
  children?: TableColumnDef<TRecord>[];
};

type DefWithOutDataIndex<TRecord> = BaseTableColumnDef & {
  dataIndex?: never;
  render?: (ctx: RenderContext<TRecord>) => ReactNode;
};
export type TableColumnDef<TRecord> = ExtraTableColumnDef<TRecord> &
  (
    | DefWithOutDataIndex<TRecord>
    | (BaseTableColumnDef &
        {
          [K in keyof TRecord]-?: {
            dataIndex: K;
            render?: (
              ctx: RenderContext<TRecord> & {
                value: TRecord[K];
              },
            ) => ReactNode;
          };
        }[keyof TRecord])
  );

type RenderContext<TRecord> = {
  record: TRecord;
  index: number;
  row: Row<TRecord>;
  column: Column<TRecord>;
};

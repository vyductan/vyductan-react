import type { ReactNode } from "react";

/**
 * TRecord[K] inherit from https://stackoverflow.com/a/56837244
 */
export type TableColumnDef<TRecord> = {
  [K in keyof TRecord]-?: {
    dataIndex?: K;
    title?: string | ReactNode;
    align?: "left" | "right" | "center";
    className?: string;
    hidden?: boolean;
    width?: number | string;
    render?: (value: TRecord[K], record: TRecord, index: number) => ReactNode;
  };
}[keyof TRecord];

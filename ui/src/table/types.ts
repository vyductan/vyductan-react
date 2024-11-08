import type {
  BuiltInSortingFn,
  Column,
  Row,
  RowData,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

type Meta<TRecord> = {
  align?: "left" | "right" | "center";
  className?: string;
  // rowName?: string | ((record: TRecord, index: number) => string);
  fixed?: "left" | "right";
  /** Sort function for local sort, see Array.sort's compareFunction. If it is server-side sorting, set to true, but if you want to support multi-column sorting, you can set it to { multiple: number }
   * boolean
   * function
   * Build-in sorting function: 'alphanumeric', 'alphanumericCaseSensitive', 'text', 'textCaseSensitive', 'datetime', 'basic'.
   * */
  sorter?: boolean | BuiltInSortingFn | ((a: TRecord, b: TRecord) => number);
};
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type
  interface ColumnMeta<TData extends RowData, TValue> extends Meta<TData> {}
}

/**
 * TRecord[K] inherit from https://stackoverflow.com/a/56837244
 */
type BaseTableColumnDef<TRecord> = {
  key?: string;
  hidden?: boolean;
  title?: string | ReactNode;
  width?: number;

  enableResizing?: boolean;
} & Meta<TRecord>;
export type ExtraTableColumnDef<TRecord> = {
  children?: TableColumnDef<TRecord>[];
};

type DefWithOutDataIndex<TRecord> = BaseTableColumnDef<TRecord> & {
  dataIndex?: never;
  render?: (context: RenderContext<TRecord>) => ReactNode;
};
export type TableColumnDef<TRecord> = ExtraTableColumnDef<TRecord> &
  (
    | DefWithOutDataIndex<TRecord>
    | (BaseTableColumnDef<TRecord> &
        {
          [K in keyof TRecord]-?: {
            dataIndex: K;
            render?: (
              context: RenderContext<TRecord, K> & {
                value: TRecord[K];
              },
            ) => ReactNode;
          };
        }[keyof TRecord])
  );

export type RenderContext<TRecord, TKey extends keyof TRecord | null = null> = {
  record: TRecord;
  index: number;
  row: Row<TRecord>;
  column: Column<TRecord>;
  value: TKey extends keyof TRecord ? TRecord[TKey] : null;
};

export type RowSelection<TRecord> = {
  type?: "checkbox" | "radio";
  /** Hide the selectAll checkbox and custom selection */
  hideSelectAll?: boolean;
  /** Controlled selected row keys */
  selectedRowKeys?: TRecord[keyof TRecord][];
  /** Callback executed when selected rows change */
  onChange?: (selectedRowKeys: TRecord[keyof TRecord][]) => void;
};

export type TableSize = "sm" | "default";

export type Key = React.Key;

export type ScrollConfig = {
  index?: number;
  key?: Key;
  top?: number;
};

// ================= Customized =================
type Component<P> =
  | React.ComponentType<P>
  | React.ForwardRefExoticComponent<P>
  | React.FC<P>
  | keyof React.ReactHTML;

export type CustomizeComponent = Component<any>;

export type OnCustomizeScroll = (info: {
  currentTarget?: HTMLElement;
  scrollLeft?: number;
}) => void;

export type CustomizeScrollBody<RecordType> = (
  data: readonly RecordType[],
  info: {
    scrollbarSize: number;
    ref: React.Ref<{
      scrollLeft: number;
      scrollTo?: (scrollConfig: ScrollConfig) => void;
    }>;
    onScroll: OnCustomizeScroll;
  },
) => React.ReactNode;

export interface TableComponents<RecordType> {
  table?: CustomizeComponent;
  header?: {
    table?: CustomizeComponent;
    wrapper?: CustomizeComponent;
    row?: CustomizeComponent;
    cell?: CustomizeComponent;
  };
  body?:
    | CustomizeScrollBody<RecordType>
    | {
        wrapper?: CustomizeComponent;
        row?: CustomizeComponent;
        cell?: CustomizeComponent;
      };
}

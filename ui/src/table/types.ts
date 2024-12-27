import type {
  BuiltInSortingFn,
  Column,
  Row,
  RowData,
} from "@tanstack/react-table";

type Meta<TRecord> = {
  title?: React.ReactNode;
  align?: "left" | "right" | "center";
  fixed?: "left" | "right";
  className?: string;
  classNames?: {
    td?: string;
  };
  // rowName?: string | ((record: TRecord, index: number) => string);
  /** Sort function for local sort, see Array.sort's compareFunction. If it is server-side sorting, set to true, but if you want to support multi-column sorting, you can set it to { multiple: number }
   * boolean
   * function
   * Build-in sorting function: 'alphanumeric', 'alphanumericCaseSensitive', 'text', 'textCaseSensitive', 'datetime', 'basic'.
   * */
  sorter?:
    | boolean
    | BuiltInSortingFn
    | ((a: TRecord, b: TRecord) => number)
    | { multiple: number; compare?: (a: TRecord, b: TRecord) => number };
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
  width?: number;

  enableResizing?: boolean;
  enableHiding?: boolean;
} & Meta<TRecord>;
export type ExtraTableColumnDef<TRecord> = {
  children?: TableColumnDef<TRecord>[];
};

type DefWithOutDataIndex<TRecord> = BaseTableColumnDef<TRecord> & {
  dataIndex?: never;
  render?: (context: RenderContext<TRecord>) => React.ReactNode;
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
            ) => React.ReactNode;
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
  onChange?: (
    selectedRowKeys: TRecord[keyof TRecord][],
    // selectedRowKeys: TRecord[keyof TRecord][],
    selectedRows: TRecord[],
  ) => void;
  /** Renderer of the `table` header */
  renderHeader?: (args: {
    checked: boolean;
    originNode: React.ReactNode;
  }) => React.ReactNode;
  /** Renderer of the `table` cell. Same as render in column */
  renderCell?: (args: {
    checked: boolean;
    record: TRecord;
    index: number;
    originNode: React.ReactNode;
  }) => React.ReactNode;
};

export type TableSize = "sm" | "default";

export type Key = React.Key;

export type FixedType = "left" | "right" | boolean;

export type ScrollConfig = {
  index?: number;
  key?: Key;
  top?: number;
};

// ================= Fix Column =================
export interface StickyOffsets {
  left: readonly number[];
  right: readonly number[];
  isSticky?: boolean;
}

// ================= Customized =================
type Component<P> =
  | React.ComponentType<P>
  | React.ForwardRefExoticComponent<P>
  | React.FC<P>
  | React.HTMLElementType;

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

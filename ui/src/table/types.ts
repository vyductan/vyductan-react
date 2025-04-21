/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type {
  BuiltInSortingFn,
  Column,
  Row,
  RowData,
  Table,
} from "@tanstack/react-table";

import type { Breakpoint } from "@acme/hooks/use-responsive";

import type { PaginationProps } from "../pagination";
import type { AnyObject } from "../types";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type
  interface ColumnMeta<TData extends RowData, TValue>
    extends ColumnDef<TData> {}
}

export type SelectionItemSelectFn = (currentRowKeys: Key[]) => void;

export interface CellType<RecordType> {
  key?: Key;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  column?: ColumnDef<RecordType>;
  colSpan?: number;
  rowSpan?: number;

  /** Only used for table header */
  hasSubColumns?: boolean;
  colStart?: number;
  colEnd?: number;
}
export interface RenderedCell<RecordType> {
  props?: CellType<RecordType>;
  children?: React.ReactNode;
}

// SpecialString will be removed in antd@6
// export type SpecialString<T> = T | (string & {});

export type DataIndex<T = any> = DeepNamePath<T>;

type ColumnSharedDef<TRecord> = {
  title?:
    | React.ReactNode
    | ((ctx: { table: Table<TRecord> }) => React.ReactNode);
  key?: string;
  className?: string;
  hidden?: boolean;
  fixed?: FixedType;
  align?: AlignType;

  // own
  classNames?: {
    head?: string;
    cell?: string;
  };

  // width?: number;
  minWidth?: number;

  enableResizing?: boolean;
  enableHiding?: boolean;

  responsive?: Breakpoint[];

  styles?: {
    head?: React.CSSProperties;
    cell?:
      | React.CSSProperties
      | ((ctx: {
          record: TRecord;
          index: number;
          row: Row<TRecord>;
          column: Column<TRecord>;
        }) => React.CSSProperties);
  };
  attributes?: Record<string, string>;
  headAttributes?: Record<string, string>;
  // rowName?: string | ((record: TRecord, index: number) => string);
  defaultSortOrder?: SortOrder;
  /** Sort function for local sort, see Array.sort's compareFunction. If it is server-side sorting, set to true, but if you want to support multi-column sorting, you can set it to { multiple: number }
   * boolean
   * function
   * Build-in sorting function: 'alphanumeric', 'alphanumericCaseSensitive', 'text', 'textCaseSensitive', 'datetime', 'basic'.
   * */
  sorter?:
    | boolean
    | BuiltInSortingFn
    | ((a: TRecord, b: TRecord) => number)
    | {
        multiple: number;
        // false to allow sorting by server api
        compare?: false | ((a: TRecord, b: TRecord) => number);
      };
};

export interface ColumnGroupDef<TRecord> extends ColumnSharedDef<TRecord> {
  children: ColumnsDef<TRecord>;
}

export type AlignType =
  | "start"
  | "end"
  | "left"
  | "right"
  | "center"
  | "justify"
  | "match-parent";

export type ColumnDef<TRecord> = ColumnSharedDef<TRecord> & {
  colSpan?: number;
  dataIndex?: DataIndex<TRecord>;
  render?: (
    ctx: RenderContext<TRecord>,
  ) => React.ReactNode | RenderedCell<TRecord>;
  shouldCellUpdate?: (record: TRecord, prevRecord: TRecord) => boolean;
  rowSpan?: number;
  width?: number | string;
  minWidth?: number;
  onCell?: GetComponentProps<TRecord>;
};

export type ColumnsDef<TRecord = AnyObject> = (
  | ColumnGroupDef<TRecord>
  | ColumnDef<TRecord>
)[];

export interface SelectionItem {
  key: string;
  text: React.ReactNode;
  onSelect?: SelectionItemSelectFn;
}

export type SelectionSelectFn<T = AnyObject> = (
  record: T,
  selected: boolean,
  selectedRows: T[],
  nativeEvent: Event,
) => void;

export type GetRowKey<RecordType> = (record: RecordType, index?: number) => Key;

// type DefWithOutDataIndex<TRecord> = ColumnSharedDef<TRecord> & {
//   dataIndex?: never;
//   render?: (context: RenderContext<TRecord>) => React.ReactNode;
// };
// /**
//  * TRecord[K] inherit from https://stackoverflow.com/a/56837244
//  */
// export type ColumnDef<TRecord> = ExtraColumnDef<TRecord> &
//   (
//     | DefWithOutDataIndex<TRecord>
//     | (ColumnSharedDef<TRecord> &
//         {
//           [K in keyof TRecord]-?: {
//             dataIndex: K;
//             render?: (
//               context: RenderContext<TRecord, K> & {
//                 value: TRecord[K];
//               },
//             ) => React.ReactNode;
//           };
//         }[keyof TRecord])
//   );

export type RowSelectionType = "checkbox" | "radio";

export type TableRowSelection<TRecord> = {
  type?: RowSelectionType;
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

/**
 * Use `start` or `end` instead. `left` or `right` is deprecated.
 */
export type FixedType = "start" | "end" | "left" | "right" | boolean;

export type ScrollConfig = {
  index?: number;
  key?: Key;
  top?: number;
};

// ================= Fix Column =================
export interface StickyOffsets {
  start: readonly number[];
  end: readonly number[];
  widths: readonly number[];
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

type TablePaginationPosition =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight"
  | "none";
export interface TablePaginationConfig extends PaginationProps {
  position?: TablePaginationPosition[];
}

export type FilterValue = (Key | boolean)[];

export type SortOrder = "descend" | "ascend" | null;
export interface SorterResult<RecordType = AnyObject> {
  column?: ColumnDef<RecordType>;
  order?: SortOrder;
  // field?: Key | readonly Key[];
  field?: Key;
  columnKey?: Key;
}

declare const _TableActions: readonly ["paginate", "sort", "filter"];
export type TableAction = (typeof _TableActions)[number];
export interface TableCurrentDataSource<RecordType = AnyObject> {
  currentDataSource: RecordType[];
  action: TableAction;
}

// =================== Expand ===================
export interface RenderExpandIconProps<RecordType> {
  // prefixCls: string;
  expanded: boolean;
  record: RecordType;
  expandable: boolean;
  onExpand: TriggerEventHandler<RecordType>;
}

export type RenderExpandIcon<RecordType> = (
  props: RenderExpandIconProps<RecordType>,
) => React.ReactNode;

// =================== Events ===================
export type TriggerEventHandler<RecordType> = (
  record: RecordType,
  event: React.MouseEvent<HTMLElement>,
) => void;

// =================== Sticky ===================
export interface TableSticky {
  offsetHeader?: number;
  offsetSummary?: number;
  offsetScroll?: number;
  getContainer?: () => Window | HTMLElement;
}

// ================= Customized =================
export type GetComponentProps<DataType> = (
  data: DataType,
  index?: number,
) => React.HTMLAttributes<any> & React.TdHTMLAttributes<any>;

export type GetComponent = (
  path: readonly string[],
  defaultComponent?: CustomizeComponent,
) => CustomizeComponent;

// ================= NamePath =================
// source https://github.com/crazyair/field-form/blob/master/src/namePathType.ts

type BaseNamePath = string | number | boolean | (string | number | boolean)[];
/**
 * Store: The store type from `FormInstance<Store>`
 * ParentNamePath: Auto generate by nest logic. Do not fill manually.
 */
export type DeepNamePath<
  Store = any,
  ParentNamePath extends any[] = [],
> = ParentNamePath["length"] extends 3
  ? never
  : // Follow code is batch check if `Store` is base type
    true extends (Store extends BaseNamePath ? true : false)
    ? ParentNamePath["length"] extends 0
      ? Store | BaseNamePath // Return `BaseNamePath` instead of array if `ParentNamePath` is empty
      : Store extends any[]
        ? [...ParentNamePath, number] // Connect path
        : never
    : Store extends any[] // Check if `Store` is `any[]`
      ? // Connect path. e.g. { a: { b: string }[] }
        // Get: [a] | [ a,number] | [ a ,number , b]
        | [...ParentNamePath, number]
          | DeepNamePath<Store[number], [...ParentNamePath, number]>
      : keyof Store extends never // unknown
        ? Store
        : {
            // Convert `Store` to <key, value>. We mark key a `FieldKey`
            [FieldKey in keyof Store]: Store[FieldKey] extends Function
              ? never
              :
                  | (ParentNamePath["length"] extends 0 ? FieldKey : never) // If `ParentNamePath` is empty, it can use `FieldKey` without array path
                  | [...ParentNamePath, FieldKey] // Exist `ParentNamePath`, connect it
                  | DeepNamePath<
                      Required<Store>[FieldKey],
                      [...ParentNamePath, FieldKey]
                    >; // If `Store[FieldKey]` is object
          }[keyof Store];

// ================= Own =================
type RenderContext<TRecord, TKey extends keyof TRecord | null = null> = {
  record: TRecord;
  index: number;
  table: Table<TRecord>;
  row: Row<TRecord>;
  column: Column<TRecord>;
  value: TKey extends keyof TRecord ? TRecord[TKey] : null;
};

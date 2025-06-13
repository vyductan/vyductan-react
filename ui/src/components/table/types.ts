/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type {
  BuiltInSortingFn,
  Column,
  Row,
  RowData,
  Table,
} from "@tanstack/react-table";
import type { XOR } from "ts-xor";

import type { Breakpoint } from "@acme/hooks/use-responsive";

import type { AnyObject } from "../../types";
import type { CheckboxProps } from "../checkbox";
import type { PaginationProps } from "../pagination";
import type { INTERNAL_SELECTION_ITEM } from "./hooks/use-selection";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type
  interface ColumnMeta<TData extends RowData, TValue>
    extends ColumnType<TData> {}
}

export type SelectionItemSelectFn = (currentRowKeys: Key[]) => void;

export type ExpandType = null | "row" | "nest";

export interface TableLocale {
  filterTitle?: string;
  filterConfirm?: React.ReactNode;
  filterReset?: React.ReactNode;
  filterEmptyText?: React.ReactNode;
  /**
   * @deprecated Please use `filterCheckAll` instead.
   */
  filterCheckall?: React.ReactNode;
  filterCheckAll?: React.ReactNode;
  filterSearchPlaceholder?: string;
  emptyText?: React.ReactNode | (() => React.ReactNode);
  selectAll?: React.ReactNode;
  selectNone?: React.ReactNode;
  selectInvert?: React.ReactNode;
  selectionAll?: React.ReactNode;
  sortTitle?: string;
  expand?: string;
  collapse?: string;
  triggerDesc?: string;
  triggerAsc?: string;
  cancelSort?: string;
}

export interface CellType<RecordType> {
  key?: Key;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  column?: ColumnType<RecordType>;
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
  children: ColumnsType<TRecord>;
}

export type AlignType =
  | "start"
  | "end"
  | "left"
  | "right"
  | "center"
  | "justify"
  | "match-parent";

export interface ColumnFilterItem {
  text: React.ReactNode;
  value: React.Key | boolean;
  children?: ColumnFilterItem[];
}

export interface ColumnTitleProps<RecordType = AnyObject> {
  /** @deprecated Please use `sorterColumns` instead. */
  sortOrder?: SortOrder;
  /** @deprecated Please use `sorterColumns` instead. */
  sortColumn?: ColumnType<RecordType>;
  sortColumns?: { column: ColumnType<RecordType>; order: SortOrder }[];

  filters?: Record<string, FilterValue>;

  table: Table<RecordType>;
}

export type ColumnTitle<RecordType = AnyObject> =
  | React.ReactNode
  | ((props: ColumnTitleProps<RecordType>) => React.ReactNode);

type RenderCellContext<TRecord> = {
  table: Table<TRecord>;
  row: Row<TRecord>;
  column: Column<TRecord>;
};

export type ColumnType<TRecord> = ColumnSharedDef<TRecord> &
  XOR<
    {
      dataIndex?: never;
      render?: (
        value: null,
        record: TRecord,
        index: number,
        // cellContext: RenderCellContext<TRecord>,
      ) => React.ReactNode;
    },
    {
      [K in keyof TRecord]-?: {
        dataIndex: K;
        render?: (
          value: TRecord[K],
          record: TRecord,
          index: number,
          // cellContext: RenderCellContext<TRecord>,
        ) => React.ReactNode;
      };
    }[keyof TRecord]
  > & {
    title?: ColumnTitle<TRecord>;

    colSpan?: number;
    dataIndex?: DataIndex<TRecord>;
    shouldCellUpdate?: (record: TRecord, prevRecord: TRecord) => boolean;
    rowSpan?: number;
    width?: number | string;
    /** Min width of this column, only works when `tableLayout="auto"` */
    minWidth?: number;
    onCell?: GetComponentProps<TRecord>;
  };

export type ColumnsType<TRecord = AnyObject> = (
  | ColumnGroupDef<TRecord>
  | ColumnType<TRecord>
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

export type GetRowKey<RecordType> = (record: RecordType, index: number) => Key;

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
  /** Keep the selection keys in list even the key not exist in `dataSource` anymore */
  preserveSelectedRowKeys?: boolean;
  type?: RowSelectionType;
  /** Controlled selected row keys */
  selectedRowKeys?: Key[];
  defaultSelectedRowKeys?: Key[];
  /** Callback executed when selected rows change */
  onChange?: (
    selectedRowKeys: Key[],
    // selectedRowKeys: TRecord[keyof TRecord][],
    selectedRows: TRecord[],
  ) => void;
  getCheckboxProps?: (
    record: TRecord,
  ) => Partial<Omit<CheckboxProps, "checked" | "defaultChecked">>;
  onSelect?: SelectionSelectFn<TRecord>;
  /** @deprecated This function is deprecated and should use `onChange` instead */
  onSelectMultiple?: (
    selected: boolean,
    selectedRows: TRecord[],
    changeRows: TRecord[],
  ) => void;
  /** @deprecated This function is deprecated and should use `onChange` instead */
  onSelectAll?: (
    selected: boolean,
    selectedRows: TRecord[],
    changeRows: TRecord[],
  ) => void;
  /** @deprecated This function is deprecated and should use `onChange` instead */
  onSelectInvert?: (selectedRowKeys: Key[]) => void;
  /** @deprecated This function is deprecated and should use `onChange` instead */
  onSelectNone?: () => void;
  selections?: INTERNAL_SELECTION_ITEM[] | boolean;
  /** Hide the selectAll checkbox and custom selection */
  hideSelectAll?: boolean;
  fixed?: FixedType;
  columnWidth?: string | number;
  columnTitle?:
    | React.ReactNode
    | ((checkboxNode: React.ReactNode) => React.ReactNode);
  checkStrictly?: boolean;
  /** Set the alignment of the selection column */
  align?: "left" | "center" | "right";
  /** Renderer of the `table` cell. Same as render in column */
  renderCell?: (
    value: boolean,
    record: TRecord,
    index: number,
    originNode: React.ReactNode,
  ) => React.ReactNode;
  onCell?: GetComponentProps<TRecord>;

  /// OWN
  /** Renderer of the `table` header */
  renderHeader?: (args: {
    checked: boolean;
    originNode: React.ReactNode;
  }) => React.ReactNode;
  /** Renderer of the `table` cell. Same as render in column */
  // renderCell?: (args: {
  //   value: boolean;
  //   record: TRecord;
  //   index: number;
  //   originNode: React.ReactNode;
  // }) => React.ReactNode;

  // columnTitle?: React.ReactNode;
  // columnWidth?: number;
  /** Hide the selectAll checkbox and custom selection */
  // hideSelectAll?: boolean;
};

export type TransformColumns<RecordType = AnyObject> = (
  columns: ColumnsType<RecordType>,
) => ColumnsType<RecordType>;

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

// ==================== Row =====================
export type RowClassName<RecordType> = (
  record: RecordType,
  index: number,
  indent: number,
) => string;

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
  column?: ColumnType<RecordType>;
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

export type ExpandableType = false | "row" | "nest";

export type ExpandedRowRender<TRcord> = (
  record: TRcord,
  index: number,
  indent: number,
  expanded: boolean,
) => React.ReactNode;

export interface RenderExpandIconProps<TRecord> {
  // prefixCls: string;
  expanded: boolean;
  record: TRecord;
  expandable: boolean;
  onExpand: TriggerEventHandler<TRecord>;
  className?: string;
}

export type RenderExpandIcon<TRecord> = (
  props: RenderExpandIconProps<TRecord>,
) => React.ReactNode;

export interface ExpandableConfig<TRecord> {
  expandedRowKeys?: readonly Key[];
  defaultExpandedRowKeys?: readonly Key[];
  expandedRowRender?: ExpandedRowRender<TRecord>;
  columnTitle?: React.ReactNode;
  expandRowByClick?: boolean;
  expandIcon?: RenderExpandIcon<TRecord>;
  onExpand?: (expanded: boolean, record: TRecord) => void;
  onExpandedRowsChange?: (expandedKeys: readonly Key[]) => void;
  defaultExpandAllRows?: boolean;
  indentSize?: number;
  /** @deprecated Please use `EXPAND_COLUMN` in `columns` directly */
  expandIconColumnIndex?: number;
  showExpandColumn?: boolean;
  expandedRowClassName?: string | RowClassName<TRecord>;
  /**
   * The property name for tree data children. Defaults to 'children'.
   * Set this to match your nested data property (e.g., 'tasks').
   */
  childrenColumnName?: string;
  rowExpandable?: (record: TRecord) => boolean;
  columnWidth?: number | string;
  fixed?: FixedType;
}

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

export type GetPopupContainer = (triggerNode: HTMLElement) => HTMLElement;

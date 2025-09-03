/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type {
  BuiltInSortingFn,
  Column,
  Row,
  RowData,
  Table,
} from "@tanstack/react-table";

import type { Breakpoint } from "@acme/hooks/use-responsive";

import type { AnyObject } from "../_util/type";
import type { CheckboxProps } from "../checkbox";
import type { DropdownProps } from "../dropdown";
import type { PaginationProps } from "../pagination";
import type { TooltipProps } from "../tooltip";
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

export type SorterTooltipTarget = "full-header" | "sorter-icon";

export type SorterTooltipProps = TooltipProps & {
  target?: SorterTooltipTarget;
};

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

export type CellEllipsisType =
  | {
      showTitle?: boolean;
    }
  | boolean;
type ColumnSharedType<TRecord> = {
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

  onHeaderCell?: GetComponentProps<ColumnsType<TRecord>[number]>;
  ellipsis?: CellEllipsisType;
};

export interface ColumnGroupType<RecordType = AnyObject>
  extends Omit<ColumnType<RecordType>, "dataIndex"> {
  children: ColumnsType<RecordType>;
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
}

export type ColumnTitle<RecordType = AnyObject> =
  | React.ReactNode
  | ((props: ColumnTitleProps<RecordType>) => React.ReactNode);

export type FilterValue = (Key | boolean)[];
export type FilterKey = (string | number)[] | null;
export type FilterSearchType<RecordType = AnyObject> =
  | boolean
  | ((input: string, record: RecordType) => boolean);
export interface FilterConfirmProps {
  closeDropdown: boolean;
}

export interface FilterRestProps {
  confirm?: boolean;
  closeDropdown?: boolean;
}

export interface FilterDropdownProps {
  prefixCls: string;
  setSelectedKeys: (selectedKeys: React.Key[]) => void;
  selectedKeys: React.Key[];
  /**
   * Confirm filter value, if you want to close dropdown before commit, you can call with
   * {closeDropdown: true}
   */
  confirm: (param?: FilterConfirmProps) => void;
  clearFilters?: (param?: FilterRestProps) => void;
  filters?: ColumnFilterItem[];
  /** Only close filterDropdown */
  close: () => void;
  visible: boolean;
}

type RenderCellContext<TRecord> = {
  table: Table<TRecord>;
  row: Row<TRecord>;
  column: Column<TRecord>;
};

// XOR<
//     {
//       dataIndex?: never;
//       render?: (
//         value: null,
//         record: TRecord,
//         index: number,
//         // cellContext: RenderCellContext<TRecord>,
//       ) => React.ReactNode;
//     },
//     {
//       [K in keyof TRecord]-?: {
//         dataIndex: K;
//         render?: (
//           value: TRecord[K],
//           record: TRecord,
//           index: number,
//           // cellContext: RenderCellContext<TRecord>,
//         ) => React.ReactNode;
//       };
//     }[keyof TRecord]
//   >
interface CoverableDropdownProps
  extends Omit<
    DropdownProps,
    | "onOpenChange"
    // === deprecated ===
    | "overlay"
    | "visible"
    | "onVisibleChange"
  > {
  onOpenChange?: (open: boolean) => void;
}
export type ColumnType<TRecord> = ColumnSharedType<TRecord> & {
  title?: ColumnTitle<TRecord>;
  // RC
  dataIndex?: DataIndex<TRecord>;
  render?: (
    value: any,
    record: TRecord,
    index: number,
    cellContext: RenderCellContext<TRecord>,
  ) => React.ReactNode | RenderedCell<TRecord>;
  shouldCellUpdate?: (record: TRecord, prevRecord: TRecord) => boolean;
  colSpan?: number;
  rowSpan?: number;
  width?: number | string;
  /** Min width of this column, only works when `tableLayout="auto"` */
  minWidth?: number;
  onCell?: GetComponentProps<TRecord>;

  /** Sort function for local sort, see Array.sort's compareFunction. If it is server-side sorting, set to true, but if you want to support multi-column sorting, you can set it to { multiple: number }
   * boolean
   * function
   * Build-in sorting function: 'alphanumeric', 'alphanumericCaseSensitive', 'text', 'textCaseSensitive', 'datetime', 'basic'.
   * */
  // Sorter
  sorter?:
    | boolean
    | BuiltInSortingFn
    | CompareFn<TRecord>
    | {
        compare?: CompareFn<TRecord>;
        /** Config multiple sorter order priority */
        multiple?: number;
      };
  sortOrder?: SortOrder;
  defaultSortOrder?: SortOrder;
  sortDirections?: SortOrder[];
  sortIcon?: (props: { sortOrder: SortOrder }) => React.ReactNode;
  showSorterTooltip?: boolean | SorterTooltipProps;

  // filter
  filtered?: boolean;
  filters?: ColumnFilterItem[];
  filterDropdown?:
    | React.ReactNode
    | ((props: FilterDropdownProps) => React.ReactNode);
  filterOnClose?: boolean;
  filterMultiple?: boolean;
  filteredValue?: FilterValue | null;
  defaultFilteredValue?: FilterValue | null;
  filterIcon?: React.ReactNode | ((filtered: boolean) => React.ReactNode);
  filterMode?: "menu" | "tree";
  filterSearch?: FilterSearchType<ColumnFilterItem>;
  onFilter?: (value: React.Key | boolean, record: TRecord) => boolean;
  /**
   * Can cover `<Dropdown>` props
   * @since 5.22.0
   */
  filterDropdownProps?: CoverableDropdownProps;
  filterResetToDefaultFilteredValue?: boolean;

  // Deprecated
  /**
   * @deprecated Please use `filterDropdownProps.open` instead.
   * @since 4.23.0
   */
  filterDropdownOpen?: boolean;
  /**
   * @deprecated Please use `filterDropdownProps.onOpenChange` instead.
   * @since 4.23.0
   */
  onFilterDropdownOpenChange?: (visible: boolean) => void;
  /** @deprecated Please use `filterDropdownProps.open` instead. */
  filterDropdownVisible?: boolean;
  /** @deprecated Please use `filterDropdownProps.onOpenChange` instead */
  onFilterDropdownVisibleChange?: (visible: boolean) => void;
};

export type ColumnsType<TRecord = AnyObject> = (
  | ColumnGroupType<TRecord>
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

export type RowSelectMethod = "all" | "none" | "invert" | "single" | "multiple";

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
    selectedRows: TRecord[],
    info: { type: RowSelectMethod },
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

export type SortOrder = "descend" | "ascend" | null;

export type CompareFn<T = AnyObject> = (
  a: T,
  b: T,
  sortOrder?: SortOrder,
) => number;

declare const _TableActions: readonly ["paginate", "sort", "filter"];
export type TableAction = (typeof _TableActions)[number];
export interface TableCurrentDataSource<RecordType = AnyObject> {
  currentDataSource: RecordType[];
  action: TableAction;
}

// =================== Expand ===================

export type ExpandableType = false | "row" | "nest";
export interface LegacyExpandableProps<RecordType> {
  /** @deprecated Use `expandable.expandedRowKeys` instead */
  expandedRowKeys?: Key[];
  /** @deprecated Use `expandable.defaultExpandedRowKeys` instead */
  defaultExpandedRowKeys?: Key[];
  /** @deprecated Use `expandable.expandedRowRender` instead */
  expandedRowRender?: ExpandedRowRender<RecordType>;
  /** @deprecated Use `expandable.expandRowByClick` instead */
  expandRowByClick?: boolean;
  /** @deprecated Use `expandable.expandIcon` instead */
  expandIcon?: RenderExpandIcon<RecordType>;
  /** @deprecated Use `expandable.onExpand` instead */
  onExpand?: (expanded: boolean, record: RecordType) => void;
  /** @deprecated Use `expandable.onExpandedRowsChange` instead */
  onExpandedRowsChange?: (expandedKeys: Key[]) => void;
  /** @deprecated Use `expandable.defaultExpandAllRows` instead */
  defaultExpandAllRows?: boolean;
  /** @deprecated Use `expandable.indentSize` instead */
  indentSize?: number;
  /** @deprecated Use `expandable.expandIconColumnIndex` instead */
  expandIconColumnIndex?: number;
  /** @deprecated Use `expandable.expandedRowClassName` instead */
  expandedRowClassName?: RowClassName<RecordType>;
  /** @deprecated Use `expandable.childrenColumnName` instead */
  childrenColumnName?: string;
  title?: PanelRender<RecordType>;
}

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
export type PanelRender<RecordType> = (
  data: readonly RecordType[],
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

export interface SorterResult<RecordType = AnyObject> {
  column?: ColumnType<RecordType>;
  order?: SortOrder;
  field?: Key | readonly Key[];
  columnKey?: Key;
}

export type GetPopupContainer = (triggerNode: HTMLElement) => HTMLElement;

export interface RcTableProps {
  // =================================== Internal ===================================
  /**
   * @private Internal usage, may remove by refactor.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  internalRefs?: {
    body: React.MutableRefObject<HTMLDivElement>;
  };
}

import type { ColumnType, GetComponentProps, StickyOffsets } from "../types";

export interface HeaderProps<RecordType> {
  columns: ColumnType<RecordType>[];
  flattenColumns: readonly ColumnType<RecordType>[];
  stickyOffsets: StickyOffsets;
  onHeaderRow: GetComponentProps<readonly ColumnType<RecordType>[]>;
}

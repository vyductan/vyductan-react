import type { ColumnDef, GetComponentProps, StickyOffsets } from "../types";

export interface HeaderProps<RecordType> {
  columns: ColumnDef<RecordType>[];
  flattenColumns: readonly ColumnDef<RecordType>[];
  stickyOffsets: StickyOffsets;
  onHeaderRow: GetComponentProps<readonly ColumnDef<RecordType>[]>;
}

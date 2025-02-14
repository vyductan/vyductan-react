import React from "react";

import type { AnyObject } from "../../types";
import type { TableColumnDef } from "../types";

function flatColumns<TRecord>(
  columns: TableColumnDef<TRecord>[],
  parentKey = "key",
): TableColumnDef<TRecord>[] {
  const flattenColumns: TableColumnDef<TRecord>[] = [];
  for (const [index, column] of columns.entries()) {
    if (typeof column === "object") {
      const { fixed } = column;
      // Convert `fixed='true'` to `fixed='left'` instead
      const parsedFixed = fixed === true ? "left" : fixed;
      const mergedKey = `${parentKey}-${index}`;

      // const subColumns = (column as ColumnGroupType<TRecord>).children;
      const subColumns = column.children;
      if (subColumns && subColumns.length > 0) {
        flattenColumns.push(
          ...flatColumns(subColumns, mergedKey).map((subColum) => ({
            fixed: parsedFixed,
            ...subColum,
          })),
        );
      } else {
        flattenColumns.push({
          key: mergedKey,
          ...column,
          fixed: parsedFixed,
        });
      }
    }
  }
  return flattenColumns;
}

export const useColumns = <TRecord extends AnyObject>({
  columns,
  scrollWidth,
}: {
  columns?: TableColumnDef<TRecord>[];
  scrollWidth?: number;
}): [
  columns: TableColumnDef<TRecord>[],
  flattenColumns: readonly TableColumnDef<TRecord>[],
] => {
  // ========================== Flatten =========================
  const flattenColumns = React.useMemo(() => {
    // if (direction === 'rtl') {
    //   return revertForRtl(flatColumns(mergedColumns));
    // }
    return flatColumns(columns ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columns,
    // direction,
    scrollWidth,
  ]);
  return [columns ?? [], flattenColumns];
};

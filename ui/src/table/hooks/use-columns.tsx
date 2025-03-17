import type { ColumnDef } from "@tanstack/react-table";
import React from "react";

import type { ResponsiveInfo } from "@acme/hooks/use-responsive";
import { useResponsive } from "@acme/hooks/use-responsive";

import type { AnyObject } from "../../types";
import type { TableProps } from "../table";
import type { TableColumnDef } from "../types";
import { transformColumnDefs } from "../utils";

function flatColumns<TRecord extends AnyObject>(
  columns: ColumnDef<TRecord>[],
  parentKey = "key",
): ColumnDef<TRecord>[] {
  const flattenColumns: ColumnDef<TRecord>[] = [];
  for (const [index, column] of columns.entries()) {
    if (typeof column === "object" && column.meta) {
      const { fixed } = column.meta;
      // Convert `fixed='true'` to `fixed='left'` instead
      const parsedFixed = fixed === true ? "left" : fixed;
      const mergedKey = `${parentKey}-${index}`;

      // const subColumns = (column as ColumnGroupType<TRecord>).children;
      const subColumns =
        "columns" in column && column.columns
          ? transformColumnDefs<TRecord>(column.columns, {})
          : [];
      if (subColumns.length > 0) {
        flattenColumns.push(
          ...flatColumns(subColumns, mergedKey).map((subColum) => ({
            ...subColum,
            meta: {
              ...subColum.meta,
              fixed: parsedFixed,
            },
          })),
        );
      } else {
        flattenColumns.push({
          id: mergedKey,
          ...column,
          meta: {
            ...column.meta,
            fixed: parsedFixed,
          },
        });
      }
    }
  }
  return flattenColumns;
}

export const useColumns = <TRecord extends AnyObject>({
  columns: columnsProp,
  rowKey,
  rowSelection: rowSelectionProp,
  expandable,
}: Pick<TableProps<TRecord>, "rowKey" | "rowSelection" | "expandable"> & {
  columns: TableColumnDef<TRecord>[];
}): [
  columns: ColumnDef<TRecord>[],
  flattenColumns: readonly ColumnDef<TRecord>[],
] => {
  const responsive = useResponsive();
  const breakpoints = new Set(
    Object.entries((responsive as ResponsiveInfo) ?? {})
      .filter(([, value]) => value)
      .map(([key]) => key),
  );

  const columns = transformColumnDefs(
    columnsProp.filter(
      (c) => !c.responsive || c.responsive.some((r) => breakpoints.has(r)),
    ),
    {
      rowKey,
      rowSelection: rowSelectionProp,
      expandable,
    },
  );
  // ========================== Flatten =========================
  const flattenColumns = React.useMemo(() => {
    return flatColumns(columns);
  }, [columns]);

  return [columns, flattenColumns];
};

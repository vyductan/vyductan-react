/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { ColumnDef as TTColumnDef } from "@tanstack/react-table";
import React from "react";

import { useResponsive } from "@acme/hooks/use-responsive";

import type { AnyObject } from "../../types";
import type { TableProps } from "../table";
import type { ColumnDef, ColumnGroupDef, ColumnsDef } from "../types";
import { transformColumnDefs } from "../utils";

function flatColumns<TRecord extends AnyObject>(
  columns: ColumnsDef<TRecord>,
  parentKey = "key",
): {
  flattenColumns: ColumnDef<TRecord>[];
  // flattenColumnsForTTTable: TTColumnDef<TRecord>[];
} {
  const flattenColumns: ColumnDef<TRecord>[] = [];
  // const flattenColumnsForTTTable: TTColumnDef<TRecord>[] = [];
  for (const [index, column] of columns.entries()) {
    const { fixed } = column;
    const parsedFixed =
      fixed === true || fixed === "left"
        ? "start"
        : fixed === "right"
          ? "end"
          : fixed;
    const mergedKey = `${parentKey}-${index}`;

    const subColumns = (column as ColumnGroupDef<TRecord>).children;
    // const subColumnsForTTTable =transformColumnDefs<TRecord>((column as ColumnGroupDef<TRecord>).children, {})

    if (subColumns && subColumns.length > 0) {
      flattenColumns.push(
        ...flatColumns(subColumns, mergedKey).flattenColumns.map(
          (subColum) => ({
            fixed: parsedFixed,
            ...subColum,
          }),
        ),
      );
      // flattenColumnsForTTTable.push(
      //   ...flatColumns(subColumns, mergedKey).flattenColumnsForTTTable.map(
      //     (subColum) => ({
      //       ...subColum,
      //       meta: {
      //         ...subColum.meta,
      //         fixed: parsedFixed,
      //       },
      //     }),
      //   ),
      // );
    } else {
      flattenColumns.push({
        key: mergedKey,
        ...column,
        fixed: parsedFixed,
      });
      // const columnsForTTTable = transformColumnDefs<TRecord>([column], {});
      // flattenColumnsForTTTable.push({
      //   id: mergedKey,
      //   ...columnsForTTTable[0],
      //   meta: {
      //     ...columnsForTTTable[0]?.meta,
      //     fixed: parsedFixed,
      //   },
      // });
    }
  }
  return {
    flattenColumns,
    // flattenColumnsForTTTable
  };
}

/**
 * Parse `columns` & `children` into `columns`.
 */
export const useColumns = <TRecord extends AnyObject>({
  columns,
  rowKey,
  rowSelection: rowSelectionProp,
  expandable,
}: Pick<TableProps<TRecord>, "rowKey" | "rowSelection" | "expandable"> & {
  columns: ColumnsDef<TRecord>;
}): [
  columns: ColumnsDef<TRecord>,
  columnsForTTTable: TTColumnDef<TRecord>[],
  flattenColumns: readonly ColumnDef<TRecord>[],
] => {
  const responsive = useResponsive();
  const breakpoints = new Set(
    Object.entries(responsive)
      .filter(([, value]) => value)
      .map(([key]) => key),
  );

  const columnsForTTTable = transformColumnDefs(
    columns.filter(
      (c) => !c.responsive || c.responsive.some((r) => breakpoints.has(r)),
    ),
    {
      rowKey,
      rowSelection: rowSelectionProp,
      expandable,
    },
  );
  // ========================== Flatten =========================
  const { flattenColumns } = React.useMemo(() => {
    return flatColumns(columns);
  }, [columns]);

  return [columns, columnsForTTTable, flattenColumns];
};

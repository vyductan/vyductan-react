/* eslint-disable react-compiler/react-compiler */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable unicorn/prefer-spread */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { ColumnDef as TTColumnDef } from "@tanstack/react-table";
import React from "react";
import toArray from "@rc-component/util/lib/Children/toArray";
import warning from "@rc-component/util/lib/warning";

import { useResponsive } from "@acme/hooks/use-responsive";

import type { AnyObject, Direction } from "../../types";
import type { TableProps } from "../table";
import type {
  ColumnDef,
  ColumnGroupDef,
  ColumnsDef,
  FixedType,
  GetRowKey,
  // Key,
  // RenderExpandIcon,
} from "../types";
import { Checkbox } from "../../checkbox";
import { Icon } from "../../icons";
import { EXPAND_COLUMN } from "../constant";
import { getRowRange, transformColumnDefs } from "../utils";
import { INTERNAL_COL_DEFINE } from "../utils/legacy-util";

export function convertChildrenToColumns<RecordType>(
  children: React.ReactNode,
): ColumnsDef<RecordType> {
  return toArray(children)
    .filter((node) => React.isValidElement(node))
    .map(({ key, props }: React.ReactElement) => {
      const { children: nodeChildren, ...restProps } = props as any;
      const column = {
        key,
        ...restProps,
      };

      if (nodeChildren) {
        column.children = convertChildrenToColumns(nodeChildren);
      }

      return column;
    });
}

function filterHiddenColumns<RecordType>(
  columns: ColumnsDef<RecordType>,
): ColumnsDef<RecordType> {
  return columns
    .filter((column) => column && typeof column === "object" && !column.hidden)
    .map((column) => {
      const subColumns = (column as ColumnGroupDef<RecordType>).children;

      if (subColumns && subColumns.length > 0) {
        return {
          ...column,
          children: filterHiddenColumns(subColumns),
        };
      }

      return column;
    });
}

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
export const useColumns = <TRecord extends AnyObject>(
  {
    columns,
    rowSelection,
    expandable,

    children,
    columnTitle,
    columnWidth,
    // rowKey,
    // rowSelection: rowSelectionProp,
    // rowSelection,

    // expandable,
    // expandedKeys,
    // expandIcon,
    // expandIconColumnIndex,
    // expandRowByClick,
    // rowExpandable,
    // onTriggerExpand,

    direction,
    fixed,
    getRowKey,
    scrollWidth,
  }: Pick<TableProps<TRecord>, "columns" | "rowSelection" | "expandable"> & {
    // columns: ColumnsDef<TRecord>;
    children?: React.ReactNode;
    columnTitle?: React.ReactNode;
    columnWidth?: number | string;

    // expandable: boolean;
    // expandedKeys: Set<Key>;
    // expandIcon?: RenderExpandIcon<TRecord>;
    // expandIconColumnIndex?: number;
    // expandRowByClick?: boolean;
    // rowExpandable?: (record: TRecord) => boolean;
    // onTriggerExpand: TriggerEventHandler<TRecord>;

    direction?: Direction;
    fixed?: FixedType;
    getRowKey: GetRowKey<TRecord>;
    scrollWidth?: number;
  },
  transformColumns:
    | null
    | ((columns: ColumnsDef<TRecord>) => ColumnsDef<TRecord>),
): [
  columns: ColumnsDef<TRecord>,
  columnsForTTTable: TTColumnDef<TRecord>[],
  flattenColumns: readonly ColumnDef<TRecord>[],
] => {
  const baseColumns = React.useMemo<ColumnsDef<TRecord>>(() => {
    const newColumns = columns || convertChildrenToColumns(children) || [];

    return filterHiddenColumns(newColumns.slice());
  }, [columns, children]);

  // ========================== Selections ==========================
  const selectionColumn = React.useMemo<ColumnDef<TRecord> | undefined>(() => {
    if (rowSelection) {
      let lastSelectedId = "";
      return {
        key: "selection",
        width: 32,
        minWidth: 32,
        align: "center",
        //   enableSorting: false,
        // enableHiding: false,
        title: ({ table }) => {
          const originNode = (
            <Checkbox
              aria-label="Select all"
              className="flex items-center justify-center"
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={table.getIsSomePageRowsSelected()}
              onChange={table.toggleAllPageRowsSelected}
            />
          );
          return rowSelection?.renderHeader
            ? rowSelection.renderHeader({
                checked: table.getIsAllPageRowsSelected(),
                originNode,
              })
            : originNode;
        },
        render: ({ table, row }) => {
          const originNode = (
            <Checkbox
              aria-label="Select row"
              className="flex items-center justify-center"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
              onClick={(event) => {
                if (event.shiftKey) {
                  const { rows, rowsById } = table.getRowModel();
                  const rowsToToggle = getRowRange(
                    rows,
                    row.id,
                    lastSelectedId,
                  );
                  const isLastSelected =
                    rowsById[lastSelectedId]?.getIsSelected();
                  for (const row of rowsToToggle)
                    row.toggleSelected(isLastSelected);
                }

                lastSelectedId = row.id;
              }}
            />
          );
          return rowSelection?.renderCell
            ? rowSelection.renderCell({
                checked: row.getIsSelected(),
                record: row.original,
                index: row.index,
                originNode,
              })
            : originNode;
        },
        // ...rowSelection,
      } satisfies ColumnDef<TRecord>;
    }
  }, [rowSelection]);
  if (selectionColumn) baseColumns.unshift(selectionColumn);

  // ========================== Expand ==========================
  const withExpandColumns = React.useMemo<ColumnsDef<TRecord>>(() => {
    if (expandable) {
      let cloneColumns = baseColumns.slice();

      // // >>> Warning if use `expandIconColumnIndex`
      // if (
      //   process.env.NODE_ENV !== "production" &&
      //   expandIconColumnIndex !== undefined &&
      //   expandIconColumnIndex >= 0
      // ) {
      //   warning(
      //     false,
      //     "`expandIconColumnIndex` is deprecated. Please use `Table.EXPAND_COLUMN` in `columns` instead.",
      //   );
      // }

      // >>> Insert expand column if not exist
      if (!cloneColumns.includes(EXPAND_COLUMN)) {
        const expandColIndex = 0;
        // const expandColIndex = expandIconColumnIndex || 0;
        if (
          expandColIndex >= 0 &&
          (expandColIndex || fixed === "left" || fixed === "start" || !fixed)
        ) {
          cloneColumns.splice(expandColIndex, 0, EXPAND_COLUMN);
        }
        if (fixed === "right" || fixed === "end") {
          cloneColumns.splice(baseColumns.length, 0, EXPAND_COLUMN);
        }
      }

      // >>> Deduplicate additional expand column
      if (
        process.env.NODE_ENV !== "production" &&
        cloneColumns.filter((c) => c === EXPAND_COLUMN).length > 1
      ) {
        warning(
          false,
          "There exist more than one `EXPAND_COLUMN` in `columns`.",
        );
      }
      const expandColumnIndex = cloneColumns.indexOf(EXPAND_COLUMN);
      cloneColumns = cloneColumns.filter(
        (column, index) =>
          column !== EXPAND_COLUMN || index === expandColumnIndex,
      );

      // >>> Check if expand column need to fixed
      const prevColumn = baseColumns[expandColumnIndex];

      let fixedColumn: FixedType | null;
      if (fixed) {
        fixedColumn = fixed;
      } else {
        fixedColumn = prevColumn && prevColumn.fixed ? prevColumn.fixed : null;
      }

      // >>> Create expandable column
      const expandColumn: ColumnDef<TRecord> & {
        [INTERNAL_COL_DEFINE]: { columnType: "EXPAND_COLUMN" };
      } = {
        [INTERNAL_COL_DEFINE]: {
          // className: `${prefixCls}-expand-icon-col`,
          columnType: "EXPAND_COLUMN",
        },
        title: columnTitle,
        fixed: fixedColumn ?? undefined,
        // className: `${prefixCls}-row-expand-icon-cell`,
        width: columnWidth,
        render: ({ row }) => {
          return row.getCanExpand() ? (
            <button
              {...{
                onClick: () => {
                  if (!expandable?.expandRowByClick) {
                    row.getToggleExpandedHandler()();
                  }
                },
              }}
              className="flex w-full cursor-pointer items-center justify-center"
            >
              {row.getIsExpanded() ? (
                <Icon icon="icon-[lucide--chevron-down]" />
              ) : (
                <Icon icon="icon-[lucide--chevron-right]" />
              )}
            </button>
          ) : undefined;
          // },
          // const rowKey = getRowKey(record, index);
          // const expanded = expandedKeys.has(rowKey);
          // const recordExpandable = rowExpandable ? rowExpandable(record) : true;

          // const icon = expandIcon?.({
          //   // prefixCls,
          //   expanded,
          //   expandable: recordExpandable,
          //   record,
          //   onExpand: onTriggerExpand,
          // });

          // if (expandRowByClick) {
          //   return <span onClick={(e) => e.stopPropagation()}>{icon}</span>;
          // }
          // return icon;
        },
      };

      return cloneColumns.map((col) =>
        col === EXPAND_COLUMN ? expandColumn : col,
      );
    }

    if (
      process.env.NODE_ENV !== "production" &&
      baseColumns.includes(EXPAND_COLUMN)
    ) {
      warning(
        false,
        "`expandable` is not config but there exist `EXPAND_COLUMN` in `columns`.",
      );
    }

    return baseColumns.filter((col) => col !== EXPAND_COLUMN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    expandable,
    baseColumns,
    getRowKey,
    // expandedKeys, expandIcon,
    direction,
  ]);

  // ========================= Transform ========================
  const mergedColumns = React.useMemo(() => {
    let finalColumns = withExpandColumns;
    if (transformColumns) {
      finalColumns = transformColumns(finalColumns);
    }

    // Always provides at least one column for table display
    if (finalColumns.length === 0) {
      finalColumns = [
        {
          render: () => null,
        },
      ];
    }
    return finalColumns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformColumns, withExpandColumns, direction]);

  // ========================== Responsive ==========================
  const responsive = useResponsive();
  const breakpoints = new Set(
    Object.entries(responsive)
      .filter(([, value]) => value)
      .map(([key]) => key),
  );

  // ========================== Flatten =========================
  const { flattenColumns } = React.useMemo(
    () => flatColumns(mergedColumns),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mergedColumns, direction, scrollWidth],
  );

  // ========================== For TT Table =========================
  const columnsForTTTable = transformColumnDefs(
    mergedColumns.filter(
      (c) => !c.responsive || c.responsive.some((r) => breakpoints.has(r)),
    ),
    {
      // rowKey,
      // rowSelection: rowSelectionProp,
      // expandable,
    },
  );

  return [mergedColumns, columnsForTTTable, flattenColumns];
};

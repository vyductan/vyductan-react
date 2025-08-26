/* eslint-disable unicorn/prefer-logical-operator-over-ternary */
/* eslint-disable react-hooks/react-compiler */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable unicorn/prefer-spread */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { ColumnDef as TTColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import toArray from "@rc-component/util/lib/Children/toArray";
import warning from "@rc-component/util/lib/warning";

import type { Breakpoint } from "../../_util/responsive-observer";
import type { AnyObject } from "../../_util/type";
import type { Direction } from "../../../types";
import type {
  ColumnGroupType,
  ColumnsType,
  ColumnType,
  FixedType,
  GetRowKey,
  Key,
  RenderExpandIcon,
  TriggerEventHandler,
  // Key,
  // RenderExpandIcon,
} from "../types";
import useBreakpoint from "../../grid/hooks/use-breakpoint";
import { EXPAND_COLUMN } from "../constant";
import { getColumnKey, transformColumnDefs } from "../util";
import { INTERNAL_COL_DEFINE } from "../utils/legacy-util";

export function convertChildrenToColumns<RecordType>(
  children: React.ReactNode,
): ColumnsType<RecordType> {
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
  columns: ColumnsType<RecordType>,
): ColumnsType<RecordType> {
  return columns
    .filter((column) => column && typeof column === "object" && !column.hidden)
    .map((column) => {
      const subColumns = (column as ColumnGroupType<RecordType>).children;

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
  columns: ColumnsType<TRecord>,
  parentKey = "key",
): {
  flattenColumns: ColumnType<TRecord>[];
  // flattenColumnsForTTTable: TTColumnDef<TRecord>[];
} {
  const flattenColumns: ColumnType<TRecord>[] = [];
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

    if ("children" in column) {
      flattenColumns.push(
        ...flatColumns(column.children, mergedKey).flattenColumns.map(
          (subColum) => ({
            fixed: parsedFixed,
            ...subColum,
          }),
        ),
      );
    } else {
      flattenColumns.push({
        key: mergedKey,
        ...column,
        fixed: parsedFixed,
      });
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
    // rowSelection,

    children,

    // columnWidth,
    // rowKey,
    // rowSelection: rowSelectionProp,
    // rowSelection,
    childrenColumnName,

    expandable,
    expandedKeys,
    expandColumnTitle,
    expandColumnWidth,
    expandIcon,
    expandIconColumnIndex,
    expandedRowOffset = 0,
    expandRowByClick,
    rowExpandable,
    onTriggerExpand,

    direction,
    fixed,
    getRowKey,
    scrollWidth,
  }: {
    columns?: ColumnsType<TRecord>;
    children?: React.ReactNode;

    expandable: boolean;
    expandedKeys: Set<Key>;
    expandColumnTitle?: React.ReactNode;
    expandColumnWidth?: number | string;
    expandIcon?: RenderExpandIcon<TRecord>;
    expandIconColumnIndex?: number;
    expandRowByClick?: boolean;
    rowExpandable?: (record: TRecord) => boolean;
    onTriggerExpand: TriggerEventHandler<TRecord>;

    direction?: Direction;
    fixed?: FixedType;
    getRowKey: GetRowKey<TRecord>;
    scrollWidth?: number;
    expandedRowOffset?: number;

    childrenColumnName?: string;
  },
  transformColumns:
    | null
    | ((columns: ColumnsType<TRecord>) => ColumnsType<TRecord>),
): [
  columns: ColumnsType<TRecord>,
  columnsForTTTable: TTColumnDef<TRecord>[],
  flattenColumns: readonly ColumnType<TRecord>[],
] => {
  const baseColumns = React.useMemo<ColumnsType<TRecord>>(() => {
    const newColumns = columns || convertChildrenToColumns(children) || [];

    return filterHiddenColumns(newColumns.slice());
  }, [columns, children]);

  // ========================== Responsive ==========================
  const needResponsive = React.useMemo(
    () => baseColumns.some((col) => col.responsive),
    [baseColumns],
  );
  const screens = useBreakpoint(needResponsive);

  const responsiveColumns = React.useMemo(() => {
    const matched = new Set(
      Object.keys(screens).filter((m) => screens[m as Breakpoint]),
    );

    return baseColumns.filter(
      (c) => !c.responsive || c.responsive.some((r) => matched.has(r)),
    );
  }, [baseColumns, screens]);

  // ========================== Expand ==========================
  const withExpandColumns = React.useMemo<ColumnsType<TRecord>>(() => {
    if (expandable) {
      let cloneColumns = responsiveColumns.slice();

      // >>> Warning if use `expandIconColumnIndex`
      if (
        process.env.NODE_ENV !== "production" &&
        expandIconColumnIndex !== undefined &&
        expandIconColumnIndex >= 0
      ) {
        warning(
          false,
          "`expandIconColumnIndex` is deprecated. Please use `Table.EXPAND_COLUMN` in `columns` instead.",
        );
      }

      // >>> Insert expand column if not exist
      if (!cloneColumns.includes(EXPAND_COLUMN)) {
        const expandColIndex = expandIconColumnIndex || 0;
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
        fixedColumn = prevColumn?.fixed ? prevColumn.fixed : null;
      }

      // >>> Create expandable column
      const expandColumn: ColumnType<TRecord> & {
        [INTERNAL_COL_DEFINE]: { columnType: "EXPAND_COLUMN" };
      } = {
        [INTERNAL_COL_DEFINE]: {
          columnType: "EXPAND_COLUMN",
        },
        title: expandColumnTitle,
        fixed: fixedColumn ?? undefined,
        width: expandColumnWidth ?? 50,
        render: (_, record, index, { row }) => {
          // const record = row.original;
          // return row.getCanExpand() && row.original.children ? (
          //   <button
          //     {...(expandedKeys
          //       ? {
          //           onClick: () => {
          //             if (!expandRowByClick) {
          //               // row.getToggleExpandedHandler()();
          //               onTriggerExpand?.(!expanded, record);
          //             }
          //           },
          //         }
          //       : {
          //           onClick: () => {
          //             if (!expandRowByClick) {
          //               row.getToggleExpandedHandler()();
          //             }
          //           },
          //         })}
          //     className="flex w-full cursor-pointer items-center justify-center"
          //   >
          //     {row.getIsExpanded() ? (
          //       <Icon icon="icon-[lucide--chevron-down]" />
          //     ) : (
          //       <Icon icon="icon-[lucide--chevron-right]" />
          //     )}
          //   </button>
          // ) : undefined;
          // },
          const rowKey = getRowKey(record, index);
          const expanded = expandedKeys.has(rowKey);
          // const expanded = row.getIsExpanded();

          const recordExpandable = rowExpandable ? rowExpandable(record) : true;
          //  (row.getCanExpand() ??
          //   (mergedChildrenColumnName &&
          //     !!record[mergedChildrenColumnName]) ??
          //   true);

          const icon = expandIcon?.({
            // prefixCls,
            expanded,
            expandable: recordExpandable,
            record,
            onExpand: (record, event) => {
              onTriggerExpand(record, event);
              row.getToggleExpandedHandler()();
            },
          });

          if (expandRowByClick) {
            return <span onClick={(e) => e.stopPropagation()}>{icon}</span>;
          }
          return icon;
        },
      };

      return cloneColumns.map((col, index) => {
        const column = col === EXPAND_COLUMN ? expandColumn : col;
        if (index < expandedRowOffset) {
          return {
            ...column,
            fixed: column.fixed || "start",
          };
        }
        return column;
      });
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
    expandedKeys,
    expandIcon,
    direction,
    expandedRowOffset,

    // expandColumnTitle,
    // expandColumnWidth,
    // expandRowByClick,
    // fixed,
    // mergedChildrenColumnName,
    // onTriggerExpand,
    // rowExpandable,
    // direction,
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

    // Set key for tanstaack table id
    return finalColumns.map((col, colIndex) => {
      return {
        ...col,
        key: getColumnKey(col, colIndex.toString()).toString(),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformColumns, withExpandColumns, direction]);

  // ========================== Flatten =========================
  const { flattenColumns } = React.useMemo(
    () => flatColumns(mergedColumns),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mergedColumns, direction, scrollWidth],
  );

  // ========================== For TT Table =========================
  // const columnsForTTTable = transformColumnDefs(mergedColumns, {
  //   // rowKey,
  //   // rowSelection: rowSelectionProp,
  //   expandable: childrenColumnName
  //     ? {
  //         childrenColumnName,
  //         expandIcon,
  //       }
  //     : undefined,
  // });

  const columnsForTTTable = useMemo(() => {
    return transformColumnDefs(mergedColumns, {
      // rowKey,
      // rowSelection: rowSelectionProp,
      expandable: childrenColumnName
        ? {
            childrenColumnName,
            expandIcon,
          }
        : undefined,
    });
  }, [childrenColumnName, expandIcon, mergedColumns]);

  return [mergedColumns, columnsForTTTable, flattenColumns];
};

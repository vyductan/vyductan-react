/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { Row, ColumnDef as TTColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";

import type { AnyObject } from "../_util/type";
import type { OwnTableProps } from "./table";
import type {
  ColumnsType,
  ColumnTitle,
  ColumnTitleProps,
  ColumnType,
  Key,
} from "./types";

export const transformColumnDefs = <TRecord extends AnyObject>(
  columns: ColumnsType<TRecord>,
  props: Pick<OwnTableProps<TRecord>, "rowKey" | "rowSelection" | "expandable">,
  _isNotFirstDeepColumn = true,
): TTColumnDef<TRecord>[] => {
  const columnsDef: TTColumnDef<TRecord>[] = columns.map(
    (columnProp, columnIndex) => {
      const column = columnProp as ColumnType<TRecord> & {
        children?: ColumnsType<TRecord>;
      };
      const {
        key,
        children,
        dataIndex,
        enableResizing,
        enableHiding,
        title,
        width,
        minWidth,
        render,

        // meta props
        // align,
        fixed,
        // className,
        // classNames,
        // styles,
        // defaultSortOrder,
        sorter,
        // attributes,
        // headAttributes,
        // onHeaderCell,

        ...restProps
      } = column;
      const columnDefMerged: TTColumnDef<TRecord> = {
        // accessorKey: dataIndex,
        ...(typeof dataIndex === "string"
          ? { id: key ?? dataIndex, accessorKey: dataIndex }
          : {
              id: key ?? columnIndex.toString(),
              accessorFn: () => key ?? columnIndex.toString(),
            }),
        header: ({ table }) =>
          typeof title === "function" ? title({ table }) : title,
        ...(children
          ? {
              columns: transformColumnDefs(
                // add fixed to children
                children.map((x) => ({ ...x, fixed })),
                props,
                columnIndex === 0 || false,
              ),
              // for use in Gantt
              children: transformColumnDefs(
                // add fixed to children
                children.map((x) => ({ ...x, fixed })),
                props,
              ),
            }
          : {}),
        enableResizing,
        enableHiding,
        size: typeof width === "number" ? width : undefined,
        minSize: minWidth,
        meta: column,
        // sorting
        ...(sorter
          ? {
              enableSorting: true,
              sortingFn:
                typeof sorter === "string"
                  ? sorter
                  : typeof sorter === "function"
                    ? (rowA, rowB) => sorter(rowA.original, rowB.original)
                    : // object
                      typeof sorter === "object"
                      ? "compare" in sorter
                        ? typeof sorter.compare === "boolean"
                          ? () => 0
                          : (rowA, rowB) =>
                              (
                                sorter.compare as (
                                  a: TRecord,
                                  b: TRecord,
                                ) => number
                              )(rowA.original, rowB.original)
                        : "auto"
                      : // boolean
                        "auto",
            }
          : { enableSorting: false }),
        ...restProps,
      };
      columnDefMerged.cell = ({ column, row, getValue, table }) => (
        <>
          {/* Tree Data */}
          {row.depth > 0 && column.getIndex() === 0 && (
            <>
              <span
                style={{
                  paddingLeft: `${row.depth * 2}rem`,
                }}
              />
            </>
          )}
          {props.expandable?.childrenColumnName &&
            props.expandable.childrenColumnName in row.original &&
            row.getCanExpand() &&
            column.getIndex() === 0 && (
              <>
                {props.expandable.expandIcon?.({
                  record: row.original,
                  expanded: row.getIsExpanded(),
                  expandable: row.getCanExpand(),
                  onExpand: row.getToggleExpandedHandler(),
                  className: "mb-0.5 mr-2",
                })}
              </>
            )}
          {/* {props.childrenColumnName &&
            row.original[props.childrenColumnName] && (
              <>
                {row.getCanExpand() && row.original.children ? (
                <button
                  onClick={row.getToggleExpandedHandler()}
                  className="w-5"
                >
                  {row.getIsExpanded() ? "👇" : "👉"}
                </button>
              ) : (
                <span className="pl-5" />
              )}
              </>
            )} */}
          {/* render value*/}
          {render
            ? typeof dataIndex === "string"
              ? render(getValue() as never, row.original, row.index, {
                  table,
                  column,
                  row,
                })
              : render(undefined as never, row.original, row.index, {
                  table,
                  column,
                  row,
                })
            : (getValue() as ReactNode)}
        </>
      );

      return columnDefMerged;
    },
  );

  // if (props.rowSelection) {
  //   let lastSelectedId = "";

  //   const selectionColumn: TTColumnDef<TRecord> = {
  //     id: "selection",
  //     header: ({ table }) => {
  //       const originNode = (
  //         <Checkbox
  //           aria-label="Select all"
  //           className="flex items-center justify-center"
  //           checked={table.getIsAllPageRowsSelected()}
  //           indeterminate={table.getIsSomePageRowsSelected()}
  //           onChange={table.toggleAllPageRowsSelected}
  //         />
  //       );
  //       return props.rowSelection?.renderHeader
  //         ? props.rowSelection.renderHeader({
  //             checked: table.getIsAllPageRowsSelected(),
  //             originNode,
  //           })
  //         : originNode;
  //     },
  //     cell: ({ row, table }) => {
  //       const originNode = (
  //         <Checkbox
  //           aria-label="Select row"
  //           className="flex items-center justify-center"
  //           checked={row.getIsSelected()}
  //           disabled={!row.getCanSelect()}
  //           onChange={row.getToggleSelectedHandler()}
  //           onClick={(event) => {
  //             if (event.shiftKey) {
  //               const { rows, rowsById } = table.getRowModel();
  //               const rowsToToggle = getRowRange(rows, row.id, lastSelectedId);
  //               const isLastSelected =
  //                 rowsById[lastSelectedId]?.getIsSelected();
  //               for (const row of rowsToToggle)
  //                 row.toggleSelected(isLastSelected);
  //             }

  //             lastSelectedId = row.id;
  //           }}
  //         />
  //       );
  //       return props.rowSelection?.renderCell
  //         ? props.rowSelection.renderCell({
  //             checked: row.getIsSelected(),
  //             record: row.original,
  //             index: row.index,
  //             originNode,
  //           })
  //         : originNode;
  //     },
  //     size: 32,
  //     minSize: 32,
  //     meta: {
  //       align: "center",
  //     },
  //     enableSorting: false,
  //     enableHiding: false,
  //   };
  //   columnsDef.unshift(selectionColumn);
  // }

  // if (props.expandable) {
  //   const expandColumn: TTColumnDef<TRecord> = {
  //     id: "expander",
  //     size: 50,
  //     meta: {
  //       align: "center",
  //     },
  //     cell: ({ row }) => {
  //       return row.getCanExpand() ? (
  //         <button
  //           {...{
  //             onClick: () => {
  //               if (!props.expandable?.expandRowByClick) {
  //                 row.getToggleExpandedHandler()();
  //               }
  //             },
  //           }}
  //           className="flex w-full cursor-pointer items-center justify-center"
  //         >
  //           {row.getIsExpanded() ? (
  //             <Icon icon="icon-[lucide--chevron-down]" />
  //           ) : (
  //             <Icon icon="icon-[lucide--chevron-right]" />
  //           )}
  //         </button>
  //       ) : undefined;
  //     },
  //   };
  //   columnsDef.unshift(expandColumn);
  // }

  return columnsDef;
};

export function getRowRange<T>(rows: Array<Row<T>>, idA: string, idB: string) {
  const range: Array<Row<T>> = [];
  let foundStart = false;
  let foundEnd = false;
  // for (let index = 0; index < rows.length; index += 1) {
  for (const row of rows) {
    if (row.id === idA || row.id === idB) {
      if (foundStart) {
        foundEnd = true;
      }
      if (!foundStart) {
        foundStart = true;
      }
    }

    if (foundStart) {
      range.push(row);
    }

    if (foundEnd) {
      break;
    }
  }

  return range;
}

export const transformedTanstackTableRowSelection = (
  selectedRowKeys: string[],
) => {
  const rowSelectionTst: Record<string, boolean> = {};
  for (const x of selectedRowKeys) {
    rowSelectionTst[x] = true;
  }
  return rowSelectionTst;
};

export const getColumnKey = <RecordType extends AnyObject = AnyObject>(
  column: ColumnType<RecordType>,
  defaultKey: string,
): Key => {
  if ("key" in column && column.key !== undefined && column.key !== null) {
    return column.key;
  }
  if (column.dataIndex) {
    return Array.isArray(column.dataIndex)
      ? column.dataIndex.join(".")
      : (column.dataIndex as Key);
  }
  return defaultKey;
};

export function getColumnPos(index: number, pos?: string) {
  return pos ? `${pos}-${index}` : `${index}`;
}

export const renderColumnTitle = <RecordType extends AnyObject = AnyObject>(
  title: ColumnTitle<RecordType>,
  props: ColumnTitleProps<RecordType>,
) => {
  if (typeof title === "function") {
    return title(props);
  }
  return title;
};

/**
 * Safe get column title
 *
 * Should filter [object Object]
 *
 * @param title
 */
export const safeColumnTitle = <RecordType extends AnyObject = AnyObject>(
  title: ColumnTitle<RecordType>,
  props: ColumnTitleProps<RecordType>,
) => {
  const res = renderColumnTitle<RecordType>(title, props);
  if (Object.prototype.toString.call(res) === "[object Object]") {
    return "";
  }
  return res;
};

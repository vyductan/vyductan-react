import type { ColumnDef, Row } from "@tanstack/react-table";

import type { TableProps } from "./Table";
import type { ExtraTableColumnDef, TableColumnDef } from "./types";
import { Checkbox } from "../checkbox";

export const transformColumnDefs = <TRecord extends Record<string, unknown>>(
  columns: TableColumnDef<TRecord>[],
  props?: Pick<TableProps<TRecord>, "rowKey" | "rowSelection">,
  isNotFirstDeepColumn?: boolean,
) => {
  const columnsDef: (ColumnDef<TRecord> & ExtraTableColumnDef<TRecord>)[] =
    columns.map(
      (
        {
          children,
          dataIndex,
          enableResizing,
          title,
          width,
          render,

          // meta props
          align,
          className,
          fixed,
          sorter,

          ...restProps
        },
        index,
      ) => {
        const columnDefMerged: ColumnDef<TRecord> &
          ExtraTableColumnDef<TRecord> = {
          ...(typeof dataIndex === "string"
            ? { id: dataIndex, accessorKey: dataIndex }
            : { id: index.toString(), accessorFn: () => index.toString() }),
          header: () => title,
          ...(children
            ? {
                columns: transformColumnDefs(
                  // add fixed to children
                  children.map((x) => ({ ...x, fixed })),
                  {},
                  index === 0 || false,
                ),
                // for use in Gantt
                children: transformColumnDefs(
                  // add fixed to children
                  children.map((x) => ({ ...x, fixed })),
                ),
              }
            : {}),
          enableResizing,
          size: width,
          meta: { align, className, fixed },
          // sorting
          ...(sorter
            ? {
                enableSorting: true,
                sortingFn:
                  typeof sorter === "boolean"
                    ? "auto"
                    : typeof sorter === "string"
                      ? sorter
                      : (rowA, rowB) => sorter(rowA.original, rowB.original),
              }
            : { enableSorting: false }),
          ...restProps,
        };
        columnDefMerged.cell = ({ column, row, getValue }) => (
          <>
            {isNotFirstDeepColumn && index === 0 && (
              <>
                {row.depth > 0 && (
                  <span
                    style={{
                      paddingLeft: `${row.depth * 2}rem`,
                    }}
                  />
                )}
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
            )}

            {/* render value*/}
            {render
              ? typeof dataIndex === "string"
                ? render({
                    value: getValue() as never,
                    record: row.original,
                    index: row.index,
                    column,
                    row,
                  })
                : render({
                    value: undefined as never,
                    record: row.original,
                    index: row.index,
                    column,
                    row,
                  })
              : getValue()}
          </>
        );
        return columnDefMerged;
      },
    );

  if (props?.rowSelection) {
    const selectionColumn = createSelectColumn<TRecord>();
    columnsDef.unshift(selectionColumn);
  }

  return columnsDef;
};

function createSelectColumn<T>(): ColumnDef<T> {
  let lastSelectedId = "";

  return {
    id: "selection",
    header: ({ table }) => (
      <Checkbox
        id="select-all"
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.toggleAllRowsSelected}
        className="flex items-center justify-center"
      />
    ),
    cell: ({ row, table }) => (
      <Checkbox
        id={`select-row-${row.id}`}
        checked={row.getIsSelected()}
        indeterminate={row.getIsSomeSelected()}
        className="flex items-center justify-center"
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => {
          if (e.shiftKey) {
            const { rows, rowsById } = table.getRowModel();
            const rowsToToggle = getRowRange(rows, row.id, lastSelectedId);
            const isLastSelected = rowsById[lastSelectedId]?.getIsSelected();
            rowsToToggle.forEach((row) => row.toggleSelected(isLastSelected));
          }

          lastSelectedId = row.id;
        }}
      />
    ),
    size: 32,
    meta: {
      align: "center",
    },
  };
}

function getRowRange<T>(rows: Array<Row<T>>, idA: string, idB: string) {
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

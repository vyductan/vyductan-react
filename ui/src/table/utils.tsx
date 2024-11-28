import type { ColumnDef, Row } from "@tanstack/react-table";

import type { TableProps } from "./table";
import type { ExtraTableColumnDef, TableColumnDef } from "./types";
import { Checkbox } from "../checkbox";
import { HandleButton } from "../drag-and-drop/_components/handle";
import { Icon } from "../icons";
import { DragHandle } from "./_components/table-row-sortable";

export const transformColumnDefs = <TRecord extends Record<string, unknown>>(
  columns: TableColumnDef<TRecord>[],
  props?: Pick<
    TableProps<TRecord>,
    "rowKey" | "rowSelection" | "expandable" | "dnd"
  >,
  isNotFirstDeepColumn?: boolean,
) => {
  const mergedColumns: TableColumnDef<TRecord>[] = [
    ...(props?.dnd
      ? [
          {
            key: "sort",
            align: "center",
            width: 80,
            render: () => <DragHandle />,
          } satisfies TableColumnDef<TRecord>,
        ]
      : []),
    ...columns,
  ];
  const columnsDef: (ColumnDef<TRecord> & ExtraTableColumnDef<TRecord>)[] =
    mergedColumns.map(
      (
        {
          children,
          dataIndex,
          enableResizing,
          enableHiding,
          title,
          width,
          render,

          // meta props
          align,
          fixed,
          className,
          classNames,
          sorter,

          ...restProps
        },
        index,
      ) => {
        const columnDefMerged: ColumnDef<TRecord> &
          ExtraTableColumnDef<TRecord> = {
          // accessorKey: dataIndex,
          ...(typeof dataIndex === "string"
            ? { accessorKey: dataIndex }
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
          enableHiding,
          size: width,
          meta: { title, align, fixed, className, classNames },
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

  if (props?.dnd) {
    const dragHandleColumn: ColumnDef<TRecord> = {
      id: "sort",
      // header: () => undefined,
      size: 50,
      meta: {
        align: "center",
      },
      cell: ({ row }) => (
        <>
          <HandleButton id={row.id} /> {row.id}
        </>
      ),
    };
    columnsDef.unshift(dragHandleColumn);
  }
  if (props?.rowSelection) {
    const selectionColumn = createSelectColumn<TRecord>();
    columnsDef.unshift(selectionColumn);
  }

  if (props?.expandable) {
    const expandColumn: ColumnDef<TRecord> = {
      id: "expander",
      // header: () => undefined,
      size: 50,
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <button
            {...{
              onClick: () => {
                row.getToggleExpandedHandler()();
              },
            }}
            className="flex w-full cursor-pointer items-center justify-center"
          >
            {row.getIsExpanded() ? (
              <Icon icon="icon-[lucide--chevron-down]" className="text-base" />
            ) : (
              <Icon icon="icon-[lucide--chevron-right]" className="text-base" />
            )}
          </button>
        ) : undefined;
      },
    };
    columnsDef.unshift(expandColumn);
  }

  return columnsDef;
};

function createSelectColumn<T>(): ColumnDef<T> {
  let lastSelectedId = "";

  return {
    id: "selection",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        className="flex items-center justify-center"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={table.toggleAllPageRowsSelected}
      />
    ),
    cell: ({ row, table }) => (
      <Checkbox
        aria-label="Select row"
        className="flex items-center justify-center"
        checked={row.getIsSelected()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.toggleSelected}
        onClick={(event) => {
          if (event.shiftKey) {
            const { rows, rowsById } = table.getRowModel();
            const rowsToToggle = getRowRange(rows, row.id, lastSelectedId);
            const isLastSelected = rowsById[lastSelectedId]?.getIsSelected();
            for (const row of rowsToToggle) row.toggleSelected(isLastSelected);
          }

          lastSelectedId = row.id;
        }}
      />
    ),
    size: 40,
    meta: {
      align: "center",
    },
    enableSorting: false,
    enableHiding: false,
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

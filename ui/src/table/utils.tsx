import type { ColumnDef } from "@tanstack/react-table";

import type { TableColumnDef } from "./types";

export const transformToTanstack = <TRecord extends Record<string, unknown>>(
  columns: TableColumnDef<TRecord>[],
) => {
  const columnsDef: ColumnDef<TRecord>[] = columns.map(
    (
      { dataIndex, title, children, render, enableResizing, minSize },
      index,
    ) => {
      const columnDefMerged: ColumnDef<TRecord> = {
        ...(typeof dataIndex === "string"
          ? { id: dataIndex, accessorKey: dataIndex }
          : { id: index.toString(), accessorFn: () => index.toString() }),
        header: () => title,
        ...(children ? { columns: transformToTanstack(children) } : {}),
        enableResizing,
        minSize,
      };
      columnDefMerged.cell = ({ column, row, getValue }) => (
        <>
          {row.getCanExpand() ? (
            <button
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: {
                  cursor: "pointer",
                  paddingLeft: `${row.depth * 2}rem`,
                },
              }}
            >
              {row.getIsExpanded() ? "👇" : "👉"}
            </button>
          ) : (
            <span
              style={{
                paddingLeft: `${row.depth * 2}rem`,
              }}
            />
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
  return columnsDef;
};

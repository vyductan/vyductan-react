import type { ColumnDef } from "@tanstack/react-table";

import type { ExtraTableColumnDef, TableColumnDef } from "./types";

export const transformColumnDefs = <TRecord extends Record<string, unknown>>(
  columns: TableColumnDef<TRecord>[],
  isNotFirstDeepColumn?: boolean,
  // expandable?: {
  //   expandedRowKeys: string[];
  // },
) => {
  const columnsDef: (ColumnDef<TRecord> & ExtraTableColumnDef<TRecord>)[] =
    columns.map(
      (
        {
          dataIndex,
          title,
          children,
          render,
          enableResizing,
          minWidth,
          fixed,
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
          minSize: minWidth,
          fixed,
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
  return columnsDef;
};

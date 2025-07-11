/* eslint-disable unicorn/no-lonely-if */
// Jun 6, 2024

import type { AnyObject } from "../../_util/type";
import type { ColumnType } from "../types";
import { useTableStore } from "../hooks/use-table";

interface ColGroupProps<TRecord> {
  colWidths: readonly (number | string | undefined)[];
  columns?: readonly ColumnType<TRecord>[];
  columCount?: number;
}
const ColGroup = <TRecord extends AnyObject>({
  colWidths,
  columns,
  columCount,
}: ColGroupProps<TRecord>) => {
  const { tableLayout } = useTableStore((s) => s);

  const cols: React.ReactElement[] = [];
  const len = columCount ?? columns?.length ?? 0;

  // Only insert col with width & additional props
  // Skip if rest col do not have any useful info
  let mustInsert = false;
  for (let i = len - 1; i >= 0; i -= 1) {
    const width = colWidths[i];
    const column = columns && columns[i];
    // let additionalProps;
    let minWidth: number | undefined;
    if (column) {
      // additionalProps = column[INTERNAL_COL_DEFINE];

      // fixed will cause layout problems
      if (tableLayout === "auto") {
        minWidth = column.minWidth;
      }
    }

    if (
      width ||
      minWidth ||
      // additionalProps ||
      mustInsert
    ) {
      // const { columnType, ...restAdditionalProps } = additionalProps || {};
      cols.unshift(
        <col
          key={i}
          style={{ width, minWidth }}
          //  {...restAdditionalProps}
        />,
      );
      mustInsert = true;
    }
  }

  return <colgroup>{cols}</colgroup>;
};

export type { ColGroupProps };
export { ColGroup };

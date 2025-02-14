// Jun 6, 2024
// https://github.com/react-component/table/blob/master/src/ColGroup.tsx
import type { AnyObject } from "../../types";
import type { TableColumnDef } from "../types";

interface ColGroupProps<TRecord> {
  columns?: readonly TableColumnDef<TRecord>[];
  columCount?: number;
}
const ColGroup = <TRecord extends AnyObject>({
  columns,
  columCount,
}: ColGroupProps<TRecord>) => {
  const cols: React.ReactElement[] = [];
  const length = columCount ?? columns?.length ?? 0;

  // Only insert col with width & additional props
  // Skip if rest col do not have any useful info
  const mustInsert = columns?.some((column) => column.width ?? column.minWidth);
  if (mustInsert) {
    for (let index = length - 1; index >= 0; index -= 1) {
      const column = columns && columns[index];
      const width = column?.width;
      const minWidth = column?.minWidth;
      cols.unshift(
        <col
          key={index}
          style={{
            width,
            minWidth,
          }}
        />,
      );
    }
  }

  return <colgroup>{cols}</colgroup>;
};

export type { ColGroupProps };
export { ColGroup };

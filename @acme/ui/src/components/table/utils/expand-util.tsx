/* eslint-disable @typescript-eslint/no-explicit-any */

import type { GetRowKey, Key, RenderExpandIconProps } from "../types";
import { Icon } from "../../../icons";
import { cn } from "../../../lib/utils";

export function renderExpandIcon<RecordType>({
  record,
  onExpand,
  expanded,
  expandable,
  className,
}: RenderExpandIconProps<RecordType> & {
  className?: string;
}): React.ReactNode {
  if (!expandable) {
    return <span />;
  }

  const onClick: React.MouseEventHandler<HTMLElement> = (event) => {
    onExpand(record, event);
    event.stopPropagation();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex size-6 items-center justify-center rounded-sm border border-transparent transition-colors focus-visible:ring-3",
        className,
      )}
      aria-label={expanded ? "Collapse row" : "Expand row"}
      aria-expanded={expanded}
    >
      {expanded ? (
        <Icon icon="icon-[lucide--chevron-down]" />
      ) : (
        <Icon icon="icon-[lucide--chevron-right]" />
      )}
    </button>
  );

  // return (
  //   <span
  //     className={cn(expandClassName, {
  //       [`${prefixCls}-row-expanded`]: expanded,
  //       [`${prefixCls}-row-collapsed`]: !expanded,
  //     })}
  //     onClick={onClick}
  //   />
  // );
}

export function findAllChildrenKeys<RecordType>(
  data: readonly RecordType[],
  getRowKey: GetRowKey<RecordType>,
  childrenColumnName: string,
): Key[] {
  const keys: Key[] = [];

  function dig(list: readonly RecordType[]) {
    for (const [index, item] of (list || []).entries()) {
      keys.push(getRowKey(item, index));

      dig((item as any)[childrenColumnName]);
    }
  }

  dig(data);

  return keys;
}

export function expandedStateToExpandedRowKeys(
  expandedState: Record<string, boolean>,
): string[] {
  return Object.keys(expandedState).filter((key) => expandedState[key]);
}

// export function mergedExpandedKeysToExpandedState(
//   mergedExpandedKeys: Set<Key> | readonly Key[],
// ): Record<string, boolean> {
//   const arr = Array.isArray(mergedExpandedKeys)
//     ? mergedExpandedKeys
//     : [...mergedExpandedKeys];
//   const result: Record<string, boolean> = {};
//   for (const key of arr) {
//     result[String(key)] = true; // Use String(key) to handle symbol, bigint, etc.
//   }
//   return result;
// }

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Icon } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";

import type { GetRowKey, Key, RenderExpandIconProps } from "../types";
import { Button } from "../../button";

export function renderExpandIcon<RecordType>({
  record,
  onExpand,
  expanded,
  expandable,

  ...props
}: RenderExpandIconProps<RecordType> & {
  className?: string;
}) {
  if (!expandable) {
    return <span className={cn("")} />;
  }

  const onClick: React.MouseEventHandler<HTMLElement> = (event) => {
    onExpand(record, event);
    event.stopPropagation();
  };

  return (
    <Button
      variant="text"
      size="small"
      // {...(expandable.expandedRowKeys
      //   ? {
      //       onClick: () => {
      //         if (!expandable?.expandRowByClick) {
      //           // row.getToggleExpandedHandler()();
      //           expandable.onExpand?.(!expanded, record);
      //         }
      //       },
      //     }
      //   : {
      //       onClick: () => {
      //         if (!expandable?.expandRowByClick) {
      //           row.getToggleExpandedHandler()();
      //         }
      //       },
      //     })}
      // className="flex w-full cursor-pointer items-center justify-center"
      onClick={onClick}
      icon={
        expanded ? (
          <Icon icon="icon-[lucide--chevron-down]" />
        ) : (
          <Icon icon="icon-[lucide--chevron-right]" />
        )
      }
      {...props}
    />
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

/* eslint-disable react-hooks/react-compiler */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import * as React from "react";
import warning from "@rc-component/util/lib/warning";

import type { AnyObject } from "@acme/ui/types";

import type { TableProps } from "../table";
import type {
  ExpandableConfig,
  ExpandableType,
  GetRowKey,
  Key,
  RenderExpandIcon,
  TriggerEventHandler,
} from "../types";
import { INTERNAL_HOOKS } from "../constant";
import {
  findAllChildrenKeys,
  // mergedExpandedKeysToExpandedState,
  renderExpandIcon,
} from "../utils/expand-util";

export default function useExpand<TRecord extends AnyObject>(
  props: TableProps<TRecord>,
  mergedData: readonly TRecord[],
  getRowKey: GetRowKey<TRecord>,
): [
  expandableConfig: ExpandableConfig<TRecord>,
  expandableType: ExpandableType,
  expandedKeys: Set<Key>,
  expandIcon: RenderExpandIcon<TRecord>,
  childrenColumnName: string,
  onTriggerExpand: TriggerEventHandler<TRecord>,

  // expanded: ExpandedState,
  // setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>,
] {
  const expandableConfig = props.expandable ?? {};

  const {
    expandIcon,
    expandedRowKeys,
    defaultExpandedRowKeys,
    defaultExpandAllRows,
    expandedRowRender,
    onExpand,
    onExpandedRowsChange,
    childrenColumnName,
  } = expandableConfig;

  const mergedExpandIcon = expandIcon || renderExpandIcon;
  const mergedChildrenColumnName = childrenColumnName || "children";
  const expandableType = React.useMemo<ExpandableType>(() => {
    if (expandedRowRender) {
      return "row";
    }

    /**
     * Fix https://github.com/ant-design/ant-design/issues/21154
     * This is a workaround to not to break current behavior.
     * We can remove follow code after final release.
     *
     * To other developer:
     *  Do not use `__PARENT_RENDER_ICON__` in prod since we will remove this when refactor
     */
    if (
      (props.expandable &&
        props.internalHooks === INTERNAL_HOOKS &&
        (props.expandable as any).__PARENT_RENDER_ICON__) ||
      mergedData.some(
        (record) =>
          record &&
          typeof record === "object" &&
          record[mergedChildrenColumnName],
      )
    ) {
      return "nest";
    }

    return false;
  }, [!!expandedRowRender, mergedData]);

  const [innerExpandedKeys, setInnerExpandedKeys] = React.useState(() => {
    if (defaultExpandedRowKeys) {
      return defaultExpandedRowKeys;
    }
    if (defaultExpandAllRows) {
      return findAllChildrenKeys<TRecord>(
        mergedData,
        getRowKey,
        mergedChildrenColumnName,
      );
    }
    return [];
  });
  const mergedExpandedKeys = React.useMemo(
    () => new Set(expandedRowKeys || innerExpandedKeys || []),
    [expandedRowKeys, innerExpandedKeys],
  );

  const onTriggerExpand: TriggerEventHandler<TRecord> = React.useCallback(
    (record: TRecord) => {
      const key = getRowKey(record, mergedData.indexOf(record));

      let newExpandedKeys: Key[];
      const hasKey = mergedExpandedKeys.has(key);
      if (hasKey) {
        mergedExpandedKeys.delete(key);
        newExpandedKeys = [...mergedExpandedKeys];
      } else {
        newExpandedKeys = [...mergedExpandedKeys, key];
      }

      setInnerExpandedKeys(newExpandedKeys);
      if (onExpand) {
        onExpand(!hasKey, record);
      }
      if (onExpandedRowsChange) {
        onExpandedRowsChange(newExpandedKeys);
      }
    },
    [getRowKey, mergedExpandedKeys, mergedData, onExpand, onExpandedRowsChange],
  );

  // Warning if use `expandedRowRender` and nest children in the same time
  if (
    process.env.NODE_ENV !== "production" &&
    expandedRowRender &&
    mergedData.some((record: TRecord) => {
      return Array.isArray(record?.[mergedChildrenColumnName]);
    })
  ) {
    warning(false, "`expandedRowRender` should not use with nested Table");
  }

  return [
    expandableConfig,
    expandableType,
    mergedExpandedKeys,
    mergedExpandIcon,
    mergedChildrenColumnName,
    onTriggerExpand,

    // expanded,
    // setExpanded,
  ];
}

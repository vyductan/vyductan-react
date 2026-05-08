/* eslint-disable @typescript-eslint/no-explicit-any */


import type { ExpandedState, OnChangeFn } from "@tanstack/react-table";
import * as React from "react";
import { useMergedState } from "@rc-component/util";
import warning from "@rc-component/util/es/warning";

import type { AnyObject } from "../../_util/type";
import type { OwnTableProps } from "../table";
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
  props: OwnTableProps<TRecord>,
  mergedData: readonly TRecord[],
  getRowKey: GetRowKey<TRecord>,
): [
  ExpandedState,
  OnChangeFn<ExpandedState>,

  ExpandableConfig<TRecord>,
  expandableType: ExpandableType,
  expandedKeys: Set<Key>,
  expandIcon: RenderExpandIcon<TRecord>,
  childrenColumnName: string,
  onTriggerExpand: TriggerEventHandler<TRecord>,
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

  // ========================= Tanstack Table State =========================
  // Convert expandedRowKeys to TanStack Table's ExpandedState format
  const getExpandedStateFromKeys = React.useCallback(
    (keys: readonly Key[] | undefined): ExpandedState => {
      if (!keys || keys.length === 0) {
        return defaultExpandAllRows ? true : {};
      }
      const expandedState: Record<string, boolean> = {};
      for (const key of keys) {
        expandedState[key.toString()] = true;
      }
      return expandedState;
    },
    [defaultExpandAllRows],
  );

  const [expandedState, setExpandedStateInternal] =
    useMergedState<ExpandedState>(
      () => getExpandedStateFromKeys(defaultExpandedRowKeys),
      {
        value: expandedRowKeys
          ? getExpandedStateFromKeys(expandedRowKeys)
          : undefined,
      },
    );

  // Wrap setExpandedState to also notify parent via onExpandedRowsChange
  const setExpandedState: React.Dispatch<React.SetStateAction<ExpandedState>> =
    React.useCallback(
      (updaterOrValue) => {
        setExpandedStateInternal((prev) => {
          const newState =
            typeof updaterOrValue === "function"
              ? updaterOrValue(prev)
              : updaterOrValue;

          // Convert ExpandedState back to key array and notify parent
          if (onExpandedRowsChange && typeof newState === "object") {
            const keys = Object.entries(newState)
              .filter(([, isExpanded]) => isExpanded)
              .map(([key]) => key);
            // Use setTimeout to avoid calling during render
            setTimeout(() => onExpandedRowsChange(keys), 0);
          }

          return newState;
        });
      },
      [setExpandedStateInternal, onExpandedRowsChange],
    );

  const mergedExpandIcon = expandIcon || renderExpandIcon;
  const mergedChildrenColumnName = childrenColumnName || "children";
  const hasExpandedRowRender = !!expandedRowRender;
  const defaultExpandedAllKeys = React.useMemo(
    () =>
      defaultExpandAllRows
        ? findAllChildrenKeys<TRecord>(
            mergedData,
            getRowKey,
            mergedChildrenColumnName,
          )
        : [],
    [defaultExpandAllRows, mergedData, getRowKey, mergedChildrenColumnName],
  );
  const expandableType = React.useMemo<ExpandableType>(() => {
    if (hasExpandedRowRender) {
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
  }, [hasExpandedRowRender, props.expandable, props.internalHooks, mergedData, mergedChildrenColumnName]);

  const [innerExpandedKeys, setInnerExpandedKeys] = React.useState<readonly Key[]>(
    () => defaultExpandedRowKeys ?? [],
  );
  const mergedInnerExpandedKeys = defaultExpandAllRows
    ? defaultExpandedAllKeys
    : innerExpandedKeys;
  const mergedExpandedKeys = React.useMemo<Set<Key>>(
    () => new Set(expandedRowKeys || mergedInnerExpandedKeys || []),
    [expandedRowKeys, mergedInnerExpandedKeys],
  );

  const onTriggerExpand: TriggerEventHandler<TRecord> = React.useCallback(
    (record: TRecord) => {
      const key = getRowKey(record, mergedData.indexOf(record));

      const currentExpandedKeys = [...mergedExpandedKeys];
      const hasKey = mergedExpandedKeys.has(key);
      const newExpandedKeys: Key[] = hasKey
        ? currentExpandedKeys.filter((expandedKey) => expandedKey !== key)
        : [...currentExpandedKeys, key];

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
    expandedState,
    setExpandedState,

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

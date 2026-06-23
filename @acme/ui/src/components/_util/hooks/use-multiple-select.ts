/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from "react";

export type PrevSelectedIndex = number | undefined;

/**
 * @title multipleSelect hooks
 * @description multipleSelect by hold down shift key
 */
export default function useMultipleSelect<T, K>(getKey: (item: T) => K) {
  const [previousSelectedIndex, setPreviousSelectedIndex] =
    useState<PrevSelectedIndex>();

  const multipleSelect = useCallback(
    (currentSelectedIndex: number, data: T[], selectedKeys: Set<K>) => {
      const configPreviousSelectedIndex =
        previousSelectedIndex ?? currentSelectedIndex;

      // add/delete the selected range
      const startIndex = Math.min(
        configPreviousSelectedIndex || 0,
        currentSelectedIndex,
      );
      const endIndex = Math.max(
        configPreviousSelectedIndex || 0,
        currentSelectedIndex,
      );
      const rangeKeys = data
        .slice(startIndex, endIndex + 1)
        .map((item) => getKey(item));
      const shouldSelected = rangeKeys.some(
        (rangeKey) => !selectedKeys.has(rangeKey),
      );
      const changedKeys: K[] = [];

      rangeKeys.forEach((item) => {
        if (shouldSelected) {
          if (!selectedKeys.has(item)) {
            changedKeys.push(item);
          }
          selectedKeys.add(item);
        } else {
          selectedKeys.delete(item);
          changedKeys.push(item);
        }
      });

      setPreviousSelectedIndex(shouldSelected ? endIndex : undefined);

      return changedKeys;
    },
    [previousSelectedIndex],
  );

  const updatePreviousSelectedIndex = (value: PrevSelectedIndex) => {
    setPreviousSelectedIndex(value);
  };

  return [multipleSelect, updatePreviousSelectedIndex] as const;
}

import { cn } from "@acme/ui/lib/utils";

import type { DescriptionsItem, VerticalCell, VerticalRow } from "./types";

function fillHorizontalRow(
  row: DescriptionsItem[],
  columns: number,
  currentRowSpan: number,
): DescriptionsItem[] {
  if (row.length === 0 || currentRowSpan >= columns) {
    return [...row];
  }

  const remainingSpan = columns - currentRowSpan;
  const lastItem = row.at(-1);

  if (!lastItem) {
    return [...row];
  }

  return [
    ...row.slice(0, -1),
    {
      ...lastItem,
      span: (lastItem.span ?? 1) + remainingSpan,
    },
  ];
}

function fillVerticalRow(
  row: VerticalCell[],
  columns: number,
  currentRowSpan: number,
): VerticalCell[] {
  if (row.length === 0 || currentRowSpan >= columns) {
    return [...row];
  }

  const remainingSpan = columns - currentRowSpan;
  const lastCell = row.at(-1);

  if (!lastCell) {
    return [...row];
  }

  return [
    ...row.slice(0, -1),
    {
      ...lastCell,
      span: (lastCell.span ?? 1) + remainingSpan,
    },
  ];
}

export function createHorizontalRows(
  data: DescriptionsItem[],
  columns: number,
): DescriptionsItem[][] {
  const rows: DescriptionsItem[][] = [];
  let currentRow: DescriptionsItem[] = [];
  let currentRowSpan = 0;

  for (const item of data) {
    const itemSpan = item.span ?? 1;

    if (currentRowSpan + itemSpan > columns) {
      if (currentRow.length > 0) {
        rows.push(fillHorizontalRow(currentRow, columns, currentRowSpan));
      }

      currentRow = [];
      currentRowSpan = 0;
    }

    currentRow.push(item);
    currentRowSpan += itemSpan;
  }

  if (currentRow.length > 0) {
    rows.push(fillHorizontalRow(currentRow, columns, currentRowSpan));
  }

  return rows;
}

export function createVerticalRows(
  data: DescriptionsItem[],
  columns: number,
): VerticalRow[] {
  const rows: VerticalRow[] = [];
  let currentRowLabels: VerticalCell[] = [];
  let currentRowValues: VerticalCell[] = [];
  let currentRowSpan = 0;

  for (const item of data) {
    const itemSpan = item.span ?? 1;

    if (currentRowSpan + itemSpan > columns) {
      if (currentRowLabels.length > 0) {
        rows.push(
          fillVerticalRow(currentRowLabels, columns, currentRowSpan),
          fillVerticalRow(currentRowValues, columns, currentRowSpan),
        );
      }

      currentRowLabels = [];
      currentRowValues = [];
      currentRowSpan = 0;
    }

    currentRowLabels.push({
      span: itemSpan,
      content: item.label,
      className: cn(item.classNames?.label, item.className),
    });

    currentRowValues.push({
      span: itemSpan,
      content: item.children,
      className: cn(item.classNames?.children, item.className),
    });

    currentRowSpan += itemSpan;
  }

  if (currentRowLabels.length > 0) {
    rows.push(
      fillVerticalRow(currentRowLabels, columns, currentRowSpan),
      fillVerticalRow(currentRowValues, columns, currentRowSpan),
    );
  }

  return rows;
}

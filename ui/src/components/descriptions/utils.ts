import { cn } from "@acme/ui/lib/utils";

import type { DescriptionsItem, VerticalCell, VerticalRow } from "./types";

export function createHorizontalRows(
  data: DescriptionsItem[],
  columns: number,
): DescriptionsItem[][] {
  const rows: DescriptionsItem[][] = [];
  let currentRow: DescriptionsItem[] = [];
  let currentRowSpan = 0;

  // Process each item and create rows based on column spans
  for (const item of data) {
    const itemSpan = item.span ?? 1;

    // If adding this item would exceed the column limit, start new row
    if (currentRowSpan + itemSpan > columns) {
      // Add the current row if it has content
      if (currentRow.length > 0) {
        rows.push([...currentRow]);
      }

      // Reset for new row
      currentRow = [];
      currentRowSpan = 0;
    }

    // Add item to current row
    currentRow.push(item);
    currentRowSpan += itemSpan;
  }

  // Add the last row if it has content
  if (currentRow.length > 0) {
    rows.push(currentRow);
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

  // Process each item and create rows based on column spans
  for (const item of data) {
    const itemSpan = item.span ?? 1;

    // If adding this item would exceed the column limit, start new rows
    if (currentRowSpan + itemSpan > columns) {
      // Add the current rows if they have content
      if (currentRowLabels.length > 0) {
        rows.push([...currentRowLabels], [...currentRowValues]);
      }

      // Reset for new rows
      currentRowLabels = [];
      currentRowValues = [];
      currentRowSpan = 0;
    }

    // Add item to current rows
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

    // // If we've reached the column limit, start new rows
    // if (currentRowSpan >= columns) {
    //   rows.push([...currentRowLabels], [...currentRowValues]);
    //   currentRowLabels = [];
    //   currentRowValues = [];
    //   currentRowSpan = 0;
    // }
  }

  // Add the last rows if they have content
  if (currentRowLabels.length > 0) {
    rows.push(currentRowLabels, currentRowValues);
  }

  return rows;
}

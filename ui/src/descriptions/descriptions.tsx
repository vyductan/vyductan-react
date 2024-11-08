"use client";

import type { ReactNode } from "react";
import { Fragment } from "react";

import { useResponsive } from "@acme/hooks/useResponsive";

import type { Screens } from "../theme";
import { cn } from "..";

export type DescriptionsItem = {
  key?: React.Key;
  span?: number;
  className?: string;
  label?: React.ReactNode;
  children?: React.ReactNode;
};
type DescriptionProps = {
  title?: React.ReactNode;
  items: DescriptionsItem[];

  className?: string;

  bordered?: boolean;
  column?: number | Partial<Record<Screens, number>>;
  layout?: "horizontal" | "vertical";
  classNames?: {
    label?: string;
    content?: string;
    td?: string;
  };
  colon?: boolean;
  extra?: ReactNode;
};
export const Descriptions = ({
  title,
  items,
  extra,

  className,

  classNames,
  bordered,
  column = 3,
  layout = "horizontal",
  colon = true,
  // ...props
}: DescriptionProps) => {
  const responsiveInfo = useResponsive();

  let mergedColumn = 0;
  if (typeof column === "number") {
    mergedColumn = column;
  } else if (typeof column === "object") {
    const mergedColumnWithScreen: Partial<Record<Screens, number | undefined>> =
      {};
    for (const [k] of Object.entries(responsiveInfo)) {
      mergedColumnWithScreen[k as Screens] =
        responsiveInfo[k as Screens] && column[k as Screens]
          ? column[k as Screens]
          : undefined;
    }
    const matched = Object.entries(mergedColumnWithScreen).findLast(
      ([, v]) => v,
    )![0] as Screens;
    mergedColumn = column[matched]!;
  }

  const rows =
    layout === "horizontal"
      ? chunkArray(items, mergedColumn)
      : createVerticalRows(items, mergedColumn);

  const labelClassName = cn("text-foreground-muted", classNames?.label);
  const contentClassName = cn(classNames?.content);
  const thClassName = cn(
    "text-start text-sm font-normal",
    labelClassName,
    bordered && "border-e bg-surface-secondary",
    layout === "horizontal" && "py-4",
    layout === "vertical" && "pb-1 pl-3 first:pl-0 last:pr-0",
    layout === "vertical" && bordered && "px-6",
  );
  const tdClassName = cn(
    "break-all",
    bordered && "border-e",
    layout === "horizontal" && "pb-4 pr-4 last:pr-0",
    layout === "vertical" && "pb-4 pl-3 pr-4 align-top first:pl-0 last:pr-0",
    layout === "vertical" && bordered && "px-6",
    classNames?.td,
    contentClassName,
  );

  return (
    <div className={className}>
      {(!!title || !!extra) && (
        <div className="mb-4 flex items-center">
          <div className="text-lg font-semibold">{title}</div>
          {extra && <div className="ml-auto">{extra}</div>}
        </div>
      )}

      <div className={cn(bordered && "border")}>
        <table
          className={cn("w-full", bordered ? "table-auto" : "table-fixed")}
        >
          <tbody>
            {rows.map((cols, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  bordered && "mb-px border-b last:border-none",
                  "[&:last-child>td]:pb-0",
                )}
              >
                {cols.map((col, index) =>
                  // horizontal
                  typeof col === "object" && "label" in col ? (
                    bordered ? (
                      <Fragment key={col.key ?? index}>
                        <th className={thClassName}>
                          <span>{col.label}</span>
                        </th>
                        <td className={cn(tdClassName, "last:border-none")}>
                          <span>{col.children ?? "-"}</span>
                        </td>
                      </Fragment>
                    ) : (
                      <td
                        key={col.key ?? index}
                        className={cn("flex gap-1", tdClassName, col.className)}
                      >
                        <span className={labelClassName}>
                          {col.label}
                          {colon ? ":" : ""}
                        </span>
                        <span className={contentClassName}>{col.children}</span>
                      </td>
                    ) //vertical
                  ) : rowIndex % 2 === 0 ? (
                    <th key={index} className={thClassName} colSpan={col.span}>
                      {(col as VerticalCell).content}
                    </th>
                  ) : (
                    <td
                      key={index}
                      className={cn(tdClassName)}
                      colSpan={col.span}
                    >
                      {(col as VerticalCell).content}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunkedArray: T[][] = [];
  for (let index = 0; index < array.length; index += size) {
    const chunk = array.slice(index, index + size);
    chunkedArray.push(chunk);
  }
  return chunkedArray;
}
type VerticalCell = {
  content: ReactNode;
  span?: number;
};
type VerticalRow = VerticalCell[];
function createVerticalRows(
  data: DescriptionsItem[],
  columns: number,
): VerticalRow[] {
  const rows: VerticalRow[] = [];
  for (let index = 0; index < data.length; index += columns) {
    const labels = data.slice(index, index + columns).map((item) => ({
      span: item.span,
      content: item.label,
    }));
    const childrens = data.slice(index, index + columns).map((item) => ({
      span: item.span,
      content: item.children,
    }));
    rows.push(labels, childrens);
  }
  return rows;
}

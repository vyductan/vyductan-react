import type { ReactNode } from "react";
import { Fragment } from "react";

import { useResponsive } from "@acme/hooks/useResponsive";

import type { Screens } from "../theme";
import { clsm } from "..";

export type DescriptionsItem = {
  key: React.Key;
  label?: React.ReactNode;
  children?: React.ReactNode;
};
type DescriptionProps = {
  title?: React.ReactNode;
  items: DescriptionsItem[];

  bordered?: boolean;
  column?: number | Partial<Record<Screens, number>>;
  layout?: "horizontal" | "vertical";
  classNames?: {
    label: string;
    content: string;
  };
  extra?: ReactNode;
};
export const Descriptions = ({
  title,
  items,
  extra,

  classNames,
  bordered,
  column,
  layout = "horizontal",
  // ...props
}: DescriptionProps) => {
  const x = useResponsive();
  let mergedColumn = 3;
  if (typeof column === "number") {
    mergedColumn = column;
  } else if (typeof column === "object") {
    const mergedColumnWithScreen: Partial<Record<Screens, number | undefined>> =
      {};
    for (const [k] of Object.entries(x)) {
      mergedColumnWithScreen[k as Screens] = column[k as Screens] ?? undefined;
    }
    const matched = Object.entries(mergedColumnWithScreen).findLast(
      ([, v]) => v,
    )![0] as Screens;
    mergedColumn = column[matched]!;
  }

  const rows =
    layout === "horizontal"
      ? chunkArray(items, mergedColumn)
      : createRows(items, mergedColumn);

  const labelClassName = clsm("text-foreground-muted", classNames?.label);
  const contentClassName = clsm(classNames?.content);
  const thClassName = clsm(
    "text-start text-sm font-normal",
    labelClassName,
    bordered && "border-e bg-surface-secondary",
    layout === "horizontal" && "py-4",
    layout === "vertical" && "pb-1",
    layout === "vertical" && bordered && "px-6",
  );
  const tdClassName = clsm(
    "break-all",
    bordered && "border-e",
    layout === "horizontal" && "py-4",
    layout === "vertical" && "pb-4",
    layout === "vertical" && bordered && "px-6",
    contentClassName,
  );
  return (
    <div>
      {(!!title || !!extra) && (
        <div className="mb-4 flex items-center">
          <div className="text-lg font-semibold">{title}</div>
          {extra && <div className="ml-auto">{extra}</div>}
        </div>
      )}

      <div className={clsm(bordered && "border")}>
        <table
          className={clsm("w-full", bordered ? "table-auto" : "table-fixed")}
        >
          <tbody>
            {rows.map((cols, rowIndex) => (
              <tr
                key={rowIndex}
                className={clsm(bordered && "mb-px border-b last:border-none")}
              >
                {cols.map((col, index) =>
                  // horizontal
                  typeof col === "object" && "label" in col! ? (
                    bordered ? (
                      <Fragment key={col.key}>
                        <th className={thClassName}>
                          <span>{col.label}</span>
                        </th>
                        <td className={clsm(tdClassName, "last:border-none")}>
                          <span>{col.children ?? "-"}</span>
                        </td>
                      </Fragment>
                    ) : (
                      <td key={col.key} className="flex gap-1">
                        <span className={labelClassName}>{col.label}:</span>
                        <span className={contentClassName}>{col.children}</span>
                      </td>
                    ) //vertical
                  ) : (rowIndex % 2 === 0 ? (
                    <th key={index} className={thClassName}>
                      {col as React.ReactNode}
                    </th>
                  ) : (
                    <td key={index} className={tdClassName}>
                      {col as React.ReactNode}
                    </td>
                  )),
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
function createRows(
  data: DescriptionsItem[],
  columns: number,
): React.ReactNode[][] {
  const rows: React.ReactNode[][] = [];
  for (let index = 0; index < data.length; index += columns) {
    const labels = data.slice(index, index + columns).map((item) => item.label);
    const childrens = data
      .slice(index, index + columns)
      .map((item) => item.children);
    rows.push(labels, childrens);
  }
  return rows;
}

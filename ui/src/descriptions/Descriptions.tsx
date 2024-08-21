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
    const mergedColumnWithScreen: Partial<Record<Screens, number | null>> = {};
    Object.entries(x).forEach(([k]) => {
      mergedColumnWithScreen[k as Screens] = column[k as Screens] ?? null;
    });
    const matched = Object.entries(mergedColumnWithScreen)
      .filter(([, v]) => v)
      .slice(-1)[0]![0] as Screens;
    mergedColumn = column[matched]!;
  }

  function chunkArray<T>(array: T[], size: number): T[][] {
    const chunkedArray: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      const chunk = array.slice(i, i + size);
      chunkedArray.push(chunk);
    }
    return chunkedArray;
  }
  function createRows(
    data: DescriptionsItem[],
    columns: number,
  ): React.ReactNode[][] {
    const rows: React.ReactNode[][] = [];
    for (let i = 0; i < data.length; i += columns) {
      const labels = data.slice(i, i + columns).map((item) => item.label);
      const childrens = data.slice(i, i + columns).map((item) => item.children);
      rows.push(labels);
      rows.push(childrens);
    }
    return rows;
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
                {cols.map((col, idx) =>
                  // horizontal
                  typeof col === "object" && "label" in col! ? (
                    !bordered ? (
                      <td key={col.key} className="flex gap-1">
                        <span className={labelClassName}>{col.label}:</span>
                        <span className={contentClassName}>{col.children}</span>
                      </td>
                    ) : (
                      <Fragment key={col.key}>
                        <th className={thClassName}>
                          <span>{col.label}</span>
                        </th>
                        <td className={clsm(tdClassName, "last:border-none")}>
                          <span>{col.children ? col.children : "-"}</span>
                        </td>
                      </Fragment>
                    ) //vertical
                  ) : rowIndex % 2 === 0 ? (
                    <th key={idx} className={thClassName}>
                      {col as React.ReactNode}
                    </th>
                  ) : (
                    <td key={idx} className={tdClassName}>
                      {col as React.ReactNode}
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

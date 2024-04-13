import { useResponsive } from "@acme/hooks";

import type { Screens } from "../theme";
import { clsm } from "..";

export type DescriptionsItem = {
  label?: React.ReactNode;
  children?: React.ReactNode;
};
type DescriptionProps = {
  title?: React.ReactNode;
  items: DescriptionsItem[];

  bordered?: boolean;
  column?: number | Partial<Record<Screens, number>>;
  layout?: "horizontal" | "vertical";
  labelClassName?: string;
  contentClassName?: string;
};
export const Descriptions = ({
  title,
  items,
  bordered,
  column,
  layout = "horizontal",
  ...props
}: DescriptionProps) => {
  const x = useResponsive();
  const currentScreen = Object.entries(x)
    .filter(([, v]) => v)
    .slice(-1)[0]![0] as Screens;
  const mergedColumn =
    typeof column === "number"
      ? column
      : typeof column === "object"
        ? column[currentScreen]!
        : 3;
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

  const labelClassName = clsm("text-secondary", props.labelClassName);
  const contentClassName = clsm(props.contentClassName);
  const thClassName = clsm(
    "text-start text-sm font-normal",
    "px-6",
    labelClassName,
    bordered && "border-e bg-background-200",
    layout === "horizontal" && "py-4",
    layout === "vertical" && "pb-1",
  );
  const tdClassName = clsm(
    "break-all",
    "px-6",
    bordered && "border-e",
    layout === "horizontal" && "py-4",
    layout === "vertical" && "pb-4",
    contentClassName,
  );
  return (
    <div>
      <div className="text-lg font-semibold">{title}</div>
      <div className={clsm(bordered && "border")}>
        <table
          className={clsm("w-full", bordered ? "table-auto" : "table-fixed")}
        >
          <tbody>
            {rows.map((cols, rowIndex) => (
              <tr
                key={rowIndex}
                className={clsm(
                  bordered && "mb-[1px] border-b last:border-none",
                )}
              >
                {cols.map((col) =>
                  // horizontal
                  typeof col === "object" && "label" in col! ? (
                    !bordered ? (
                      <>
                        <td className="flex gap-1">
                          <span className={labelClassName}>{col.label}:</span>
                          <span className={contentClassName}>
                            {col.children}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <th className={thClassName}>
                          <span>{col.label}</span>
                        </th>
                        <td className={clsm(tdClassName, "last:border-none")}>
                          <span>{col.children ? col.children : "-"}</span>
                        </td>
                      </>
                    ) //vertical
                  ) : rowIndex % 2 === 0 ? (
                    <th className={thClassName}>{col as React.ReactNode}</th>
                  ) : (
                    <td className={tdClassName}>{col as React.ReactNode}</td>
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

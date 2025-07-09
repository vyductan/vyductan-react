"use client";

import type { CSSProperties, ReactNode } from "react";
import { Fragment } from "react";

import type { Screens } from "@acme/ui/types";
import { useResponsive } from "@acme/hooks/use-responsive";
import { cn } from "@acme/ui/lib/utils";

import { Skeleton } from "../skeleton";
import { DescriptionsItemContainer } from "./_components";

export type DescriptionsItem = {
  key?: React.Key;
  span?: number;
  classNames?: {
    label?: string;
    content?: string;
  };
  label?: React.ReactNode;
  children?: React.ReactNode;
};
type DescriptionProps = {
  title?: React.ReactNode;
  items: DescriptionsItem[];

  skeleton?: boolean;
  className?: string;

  bordered?: boolean;
  column?: number | Partial<Record<Screens, number>>;
  layout?: "horizontal" | "vertical";
  size?: "sm" | "default";
  classNames?: {
    root?: string;
    header?: string;
    title?: string;
    extra?: string;
    label?: string;
    content?: string;

    view?: string;
    tr?: string;
    th?: string;
    td?: string;
  };
  labelStyle?: CSSProperties;
  colon?: boolean;
  extra?: ReactNode;
};
export const Descriptions = ({
  title,
  items,
  extra,

  skeleton = false,
  size,
  className,

  classNames,
  labelStyle,
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

  const headerClassName = cn("mb-4 flex items-center", classNames?.header);
  const viewClassName = cn(
    bordered && "overflow-hidden rounded-md border",
    classNames?.view,
  );
  const labelClassName = cn(
    "text-muted-foreground inline-flex items-baseline",
    [
      "after:content-[':'] after:relative after:-mt-[0.5px] after:ml-0.5 after:mr-2",
      colon === false && "after:content-['']",
    ],
    classNames?.label,
  );
  const contentClassName = cn(
    "inline-flex items-baseline min-w-[1em]",
    classNames?.content,
  );
  const tbodyClassName = cn(
    layout === "horizontal" && [
      bordered &&
        "[&_tr:last-child>td]:border-b-0 [&_tr:last-child>th]:border-b-0",
    ],
  );
  const thClassName = cn(
    "text-start text-sm font-normal",
    layout === "horizontal" && [
      bordered && ["px-6", "border-b border-e bg-surface-secondary"],
      size === "sm" && "py-2",
      size === "default" || (!size && "py-3"),
    ],
    layout === "vertical" && [
      "pb-1 pl-3 font-medium first:pl-0 last:pr-0",
      bordered && "px-6",
    ],
    classNames?.th,
  );
  const tdClassName = cn(
    "break-all text-sm",
    layout === "horizontal" && [
      "pb-4 pr-4 text-sm",
      !bordered && "last:pr-0",
      bordered && ["px-6", "border-b border-e"],
      size === "sm" && "py-2",
      size === "default" || (!size && "py-3"),
    ],
    layout === "vertical" && [
      "gap-1 pb-4 pl-3 pr-4 align-top first:pl-0 last:pr-0",
      bordered && "px-6",
    ],
    classNames?.td,
  );

  return (
    <div className={className}>
      {(!!title || !!extra) && (
        <div className={headerClassName}>
          <div className={cn("text-lg font-semibold", classNames?.title)}>
            {title}
          </div>
          {extra && <div className="ml-auto">{extra}</div>}
        </div>
      )}

      <div className={viewClassName}>
        <table
          className={cn("w-full", bordered ? "table-auto" : "table-fixed")}
        >
          <tbody className={tbodyClassName}>
            {rows.map((cols, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  !bordered && "[&:last-child>td]:pb-0",
                  classNames?.tr,
                )}
              >
                {cols.map((col, index) =>
                  // horizontal
                  typeof col === "object" &&
                  ("label" in col || "children" in col) ? (
                    bordered ? (
                      <Fragment key={col.key ?? index}>
                        <th
                          className={cn(
                            "w-[1%] whitespace-nowrap",
                            thClassName,
                            col.classNames?.label,
                          )}
                          style={labelStyle}
                        >
                          <span>{col.label}</span>
                        </th>
                        <td
                          className={cn(
                            tdClassName,
                            col.classNames?.content,
                            "last:border-r-0",
                          )}
                        >
                          {skeleton ? (
                            <Skeleton />
                          ) : (
                            <span>{col.children ?? "-"}</span>
                          )}
                        </td>
                      </Fragment>
                    ) : (
                      <td key={col.key ?? index} className={cn(tdClassName)}>
                        <DescriptionsItemContainer>
                          {col.label && (
                            <span className={labelClassName}>{col.label}</span>
                          )}
                          {skeleton ? (
                            <Skeleton />
                          ) : (
                            <span className={contentClassName}>
                              {col.children}
                            </span>
                          )}
                        </DescriptionsItemContainer>
                      </td>
                    ) //vertical
                  ) : rowIndex % 2 === 0 ? (
                    <th
                      key={index}
                      className={cn(
                        thClassName,
                        (col as VerticalCell).className,
                      )}
                      colSpan={col.span}
                    >
                      <DescriptionsItemContainer>
                        <span className={labelClassName}>
                          {(col as VerticalCell).content}
                        </span>
                      </DescriptionsItemContainer>
                    </th>
                  ) : (
                    <td
                      key={index}
                      className={cn(tdClassName)}
                      colSpan={col.span}
                    >
                      <DescriptionsItemContainer>
                        {skeleton ? (
                          <Skeleton className="h-6" />
                        ) : (
                          <span className={contentClassName}>
                            {(col as VerticalCell).content}
                          </span>
                        )}
                      </DescriptionsItemContainer>
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
  className?: string;
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
      className: item.classNames?.label,
    }));
    const childrens = data.slice(index, index + columns).map((item) => ({
      span: item.span,
      content: item.children,
      className: item.classNames?.content,
    }));
    rows.push(labels, childrens);
  }
  return rows;
}

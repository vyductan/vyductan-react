"use client";

import type { CSSProperties, ReactNode } from "react";
import { Fragment } from "react";

import type { Screens } from "@acme/ui/types";
import { useResponsive } from "@acme/hooks/use-responsive";
import { cn } from "@acme/ui/lib/utils";

import type { SizeType } from "../config-provider/size-context";
import type { DescriptionsItem, VerticalCell } from "./types";
import { Skeleton } from "../skeleton";
import { createHorizontalRows, createVerticalRows } from "./utils";

type DescriptionsProps = {
  title?: React.ReactNode;
  items: DescriptionsItem[];

  skeleton?: boolean;
  className?: string;

  bordered?: boolean;
  column?: number | Partial<Record<Screens, number>>;
  layout?: "horizontal" | "vertical";
  size?: SizeType;
  classNames?: {
    header?: string;
    title?: string;

    view?: string;
    label?: string;
    children?: string;

    tr?: string;
    th?: string;
    td?: string;
  };
  labelStyle?: CSSProperties;
  colon?: boolean;
  extra?: ReactNode;
};
const Descriptions = ({
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
}: DescriptionsProps) => {
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
    )?.[0] as Screens;
    mergedColumn = column[matched] ?? 0;
  }

  const rows =
    layout === "horizontal"
      ? createHorizontalRows(items, mergedColumn)
      : createVerticalRows(items, mergedColumn);

  const headerClassName = cn("mb-4 flex items-center", classNames?.header);
  const viewClassName = cn(
    bordered && "overflow-hidden rounded-md border",
    classNames?.view,
  );
  const labelClassName = cn(
    "text-muted-foreground inline-flex items-baseline font-medium",
    [
      "after:content-[':'] after:relative after:-mt-[0.5px] after:ml-0.5 after:mr-2",
      layout === "horizontal" && "after:mr-2",
      colon === false && "after:content-['']",
    ],
    classNames?.label,
  );
  const childrenClassName = cn(
    "inline-flex items-baseline min-w-[1em]",
    classNames?.children,
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
      size === "small" && "py-2",
      size === "middle" || (!size && "py-3"),
    ],
    layout === "vertical" && [
      "pb-1 pl-3 first:pl-0 last:pr-0",
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
      size === "small" && "pb-2",
      size === "middle" || (!size && "pb-3"),
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
                  typeof col === "object" && "label" in col ? (
                    bordered ? (
                      <Fragment key={col.key ?? index}>
                        <th
                          className={cn(
                            "w-[1%] whitespace-nowrap",
                            thClassName,
                            col.classNames?.label,
                            col.className,
                          )}
                          style={labelStyle}
                          colSpan={col.span}
                        >
                          <span>{col.label}</span>
                        </th>
                        <td
                          className={cn(
                            tdClassName,
                            col.classNames?.children,
                            "last:border-r-0",
                            col.className,
                          )}
                          colSpan={col.span}
                        >
                          {skeleton ? (
                            <Skeleton />
                          ) : (
                            <span>{col.children ?? "-"}</span>
                          )}
                        </td>
                      </Fragment>
                    ) : (
                      <td
                        key={col.key ?? index}
                        className={cn(
                          tdClassName,
                          col.classNames?.children,
                          col.className,
                        )}
                        colSpan={col.span}
                      >
                        <span className={labelClassName}>{col.label}</span>
                        {skeleton ? (
                          <Skeleton />
                        ) : (
                          <span className={childrenClassName}>
                            {col.children}
                          </span>
                        )}
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
                      <div
                        data-slot="descriptions-item-container"
                        className={labelClassName}
                      >
                        {(col as VerticalCell).content}
                      </div>
                    </th>
                  ) : (
                    <td
                      key={index}
                      className={cn(
                        tdClassName,
                        (col as VerticalCell).className,
                      )}
                      colSpan={col.span}
                    >
                      <div
                        data-slot="descriptions-item-container"
                        className={childrenClassName}
                      >
                        {skeleton ? (
                          <Skeleton className="h-6" />
                        ) : (
                          (col as VerticalCell).content
                        )}
                      </div>
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

export type { DescriptionsProps };
export { Descriptions };

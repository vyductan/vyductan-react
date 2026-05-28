"use client";

import type {
  ComponentProps,
  CSSProperties,
  ReactElement,
  ReactNode,
} from "react";
import { Fragment } from "react";

import type { Screens } from "@acme/ui/types";
import { useResponsive } from "@acme/ui/hooks/use-responsive";
import { cn } from "@acme/ui/lib/utils";

import type { DescriptionsItem, VerticalCell } from "./types";
import { responsiveArray } from "../_util/responsive-observer";
import { Skeleton } from "../skeleton";
import { createHorizontalRows, createVerticalRows } from "./utils";

const DEFAULT_COLUMN_BY_SCREEN: Record<Screens, number> = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 4,
  xxl: 4,
};

type DescriptionsSize = "small" | "medium" | "large";

const HORIZONTAL_TH_PADDING_BY_SIZE: Record<DescriptionsSize, string> = {
  small: "py-2",
  medium: "py-2.5",
  large: "py-3",
};

const HORIZONTAL_TD_PADDING_BY_SIZE: Record<DescriptionsSize, string> = {
  small: "pb-2",
  medium: "pb-2.5",
  large: "pb-3",
};

const VERTICAL_TH_SPACING_BY_SIZE: Record<DescriptionsSize, string> = {
  small: "pb-0",
  medium: "pb-1",
  large: "pb-2",
};

const VERTICAL_TD_SPACING_BY_SIZE: Record<DescriptionsSize, string> = {
  small: "pb-2",
  medium: "pb-3",
  large: "gap-1 pb-4",
};

type DescriptionsTableProperties = Omit<
  ComponentProps<"div">,
  "title" | "children"
> & {
  title?: ReactNode;
  items: DescriptionsItem[];

  skeleton?: boolean;

  bordered?: boolean;
  column?: number | Partial<Record<Screens, number>>;
  layout?: "horizontal" | "vertical";
  size?: DescriptionsSize;
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

type DescriptionsCompoundProperties = ComponentProps<"div"> & {
  items?: never;
};

type DescriptionsProperties =
  | DescriptionsTableProperties
  | DescriptionsCompoundProperties;

function Descriptions(properties: DescriptionsProperties): ReactElement {
  if (properties.items === undefined) {
    const { className, children, ...compoundProperties } = properties;

    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4",
          className,
        )}
        {...compoundProperties}
      >
        {children}
      </div>
    );
  }

  return <DescriptionsTable {...properties} />;
}

function DescriptionsTable({
  title,
  items,
  extra,
  skeleton = false,
  size,
  className,
  classNames,
  labelStyle,
  bordered,
  column,
  layout = "horizontal",
  colon = true,
  ...properties
}: DescriptionsTableProperties): ReactElement {
  const responsiveInfo = useResponsive();

  const mergedColumn =
    typeof column === "number"
      ? column
      : (() => {
          const columnByScreen = column ?? DEFAULT_COLUMN_BY_SCREEN;
          const matched = responsiveArray.find(
            (screen) =>
              responsiveInfo[screen] && columnByScreen[screen] !== undefined,
          );
          const fallbackColumn =
            columnByScreen.md ??
            columnByScreen.sm ??
            columnByScreen.xs ??
            columnByScreen.lg ??
            columnByScreen.xl ??
            columnByScreen.xxl ??
            1;
          return matched
            ? (columnByScreen[matched] ?? fallbackColumn)
            : fallbackColumn;
        })();

  const isHorizontal = layout === "horizontal";
  const isHorizontalBorderless = isHorizontal && !bordered;
  const rows = isHorizontal
    ? createHorizontalRows(items, mergedColumn)
    : createVerticalRows(items, mergedColumn);

  const headerClassName = cn("mb-4 flex items-center", classNames?.header);
  const viewClassName = cn(
    bordered && "overflow-hidden rounded-md border",
    classNames?.view,
  );
  const labelClassName = cn(
    "text-muted-foreground inline-flex items-center",
    isHorizontalBorderless && "shrink-0 whitespace-nowrap",
    isHorizontalBorderless &&
      colon !== false &&
      "after:content-[':'] after:relative after:-mt-[0.5px] after:ml-0.5 after:mr-2",
    classNames?.label,
  );
  const childrenClassName = cn(
    "inline-flex items-baseline min-w-[1em]",
    isHorizontalBorderless && "min-w-0 flex-1",
    classNames?.children,
  );
  const horizontalBorderlessContentClassName = cn(
    isHorizontalBorderless && "flex items-baseline",
    isHorizontalBorderless && colon === false && "gap-2",
  );
  const tbodyClassName = cn(
    isHorizontal &&
      bordered &&
      "[&_tr:last-child>td]:border-b-0 [&_tr:last-child>th]:border-b-0",
  );
  const resolvedSize = size ?? "medium";
  const verticalThSpacingClass = cn(
    "pl-3 first:pl-0 last:pr-0",
    VERTICAL_TH_SPACING_BY_SIZE[resolvedSize],
  );
  const verticalTdSpacingClass = cn(
    "gap-0 pl-3 pr-4 align-top first:pl-0 last:pr-0",
    VERTICAL_TD_SPACING_BY_SIZE[resolvedSize],
  );
  const thClassName = cn(
    "text-start text-sm font-normal",
    isHorizontal && [
      bordered && ["px-6", "border-b border-e bg-surface-secondary"],
      HORIZONTAL_TH_PADDING_BY_SIZE[resolvedSize],
    ],
    !isHorizontal && [verticalThSpacingClass, bordered && "px-6"],
    classNames?.th,
  );
  const tdClassName = cn(
    "break-words text-sm",
    isHorizontal && [
      "pb-4 pr-4 text-sm",
      !bordered && "last:pr-0",
      bordered && ["px-6", "border-b border-e"],
      HORIZONTAL_TD_PADDING_BY_SIZE[resolvedSize],
    ],
    !isHorizontal && [verticalTdSpacingClass, bordered && "px-6"],
    classNames?.td,
  );

  return (
    <div className={className} {...properties}>
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
                        <div className={horizontalBorderlessContentClassName}>
                          <span className={labelClassName}>{col.label}</span>
                          {skeleton ? (
                            <Skeleton />
                          ) : (
                            <span className={childrenClassName}>
                              {col.children}
                            </span>
                          )}
                        </div>
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
}

type DescriptionsItemProperties = ComponentProps<"div">;

function DescriptionsItem({
  className,
  ...properties
}: DescriptionsItemProperties): ReactElement {
  return <div className={cn("min-w-0 space-y-1", className)} {...properties} />;
}

type DescriptionsLabelProperties = ComponentProps<"p">;

function DescriptionsLabel({
  className,
  ...properties
}: DescriptionsLabelProperties): ReactElement {
  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      {...properties}
    />
  );
}

type DescriptionsValueProperties = ComponentProps<"div"> & {
  muted?: boolean;
  truncate?: boolean;
};

function DescriptionsValue({
  className,
  muted,
  truncate,
  ...properties
}: DescriptionsValueProperties): ReactElement {
  return (
    <div
      className={cn(
        "text-foreground text-sm",
        muted && "text-muted-foreground",
        truncate && "truncate",
        className,
      )}
      {...properties}
    />
  );
}

type DescriptionsAvatarProperties = ComponentProps<"div">;

function DescriptionsAvatar({
  className,
  ...properties
}: DescriptionsAvatarProperties): ReactElement {
  return (
    <div
      className={cn(
        "bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
        className,
      )}
      {...properties}
    />
  );
}

export type {
  DescriptionsAvatarProperties as DescriptionsAvatarProps,
  DescriptionsItemProperties as DescriptionsItemProps,
  DescriptionsLabelProperties as DescriptionsLabelProps,
  DescriptionsProperties as DescriptionsProps,
  DescriptionsValueProperties as DescriptionsValueProps,
};
export {
  Descriptions,
  DescriptionsAvatar,
  DescriptionsItem,
  DescriptionsLabel,
  DescriptionsValue,
};

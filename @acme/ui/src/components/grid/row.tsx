"use client";

/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import * as React from "react";

import { cn } from "@acme/ui/lib/utils";

import type { Breakpoint, ScreenMap } from "../_util/responsive-observer";
import type { RowContextState } from "./row-context";
import { responsiveArray } from "../_util/responsive-observer";
import { ConfigContext } from "../config-provider";
import useBreakpoint from "./hooks/use-breakpoint";
import useGutter from "./hooks/use-gutter";
import RowContext from "./row-context";

const _RowAligns = ["top", "middle", "bottom", "stretch"] as const;
const _RowJustify = [
  "start",
  "end",
  "center",
  "space-around",
  "space-between",
  "space-evenly",
] as const;

type Responsive = "xxl" | "xl" | "lg" | "md" | "sm" | "xs";
type ResponsiveLike<T> = {
  [key in Responsive]?: T;
};

export type Gutter = number | undefined | Partial<Record<Breakpoint, number>>;

type ResponsiveAligns = ResponsiveLike<(typeof _RowAligns)[number]>;
type ResponsiveJustify = ResponsiveLike<(typeof _RowJustify)[number]>;
export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  gutter?: Gutter | [Gutter, Gutter];
  align?: (typeof _RowAligns)[number] | ResponsiveAligns;
  justify?: (typeof _RowJustify)[number] | ResponsiveJustify;
  prefixCls?: string;
  wrap?: boolean;
}

function useMergedPropertyByScreen(
  oriProperty: RowProps["align"] | RowProps["justify"],
  screen: ScreenMap | null,
) {
  if (typeof oriProperty === "string") {
    return oriProperty;
  }

  if (typeof oriProperty !== "object" || oriProperty === null) {
    return "";
  }

  for (let index = 0; index < responsiveArray.length; index++) {
    const breakpoint = responsiveArray[index];
    if (!screen || !breakpoint || !screen[breakpoint]) {
      continue;
    }

    const currentValue = oriProperty[breakpoint];
    if (currentValue !== undefined) {
      return currentValue;
    }
  }

  return "";
}

const Row = ({
  justify,
  align,
  className,
  style,
  children,
  gutter = 0,
  wrap,
  ...others
}: RowProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { direction } = React.useContext(ConfigContext);

  const screens = useBreakpoint(true);

  const mergedAlign = useMergedPropertyByScreen(align, screens);
  const mergedJustify = useMergedPropertyByScreen(justify, screens);

  const gutters = useGutter(gutter, screens);
  const classes = cn(
    "flex flex-wrap w-full",
    {
      "items-start": mergedAlign === "top",
      "items-center": mergedAlign === "middle",
      "items-end": mergedAlign === "bottom",
      "justify-start": mergedJustify === "start",
      "justify-end": mergedJustify === "end",
      "justify-center": mergedJustify === "center",
      "justify-around": mergedJustify === "space-around",
      "justify-between": mergedJustify === "space-between",
      "justify-evenly": mergedJustify === "space-evenly",
      "flex-nowrap": wrap === false,
      rtl: direction === "rtl",
    },
    className,
  );

  // Add gutter related style
  const rowStyle: React.CSSProperties = {};
  const horizontalGutter =
    gutters[0] != undefined && gutters[0] > 0 ? gutters[0] / -2 : undefined;

  if (horizontalGutter) {
    rowStyle.marginLeft = horizontalGutter;
    rowStyle.marginRight = horizontalGutter;
  }

  // "gutters" is a new array in each rendering phase, it'll make 'React.useMemo' effectless.
  // So we deconstruct "gutters" variable here.
  const [gutterH, gutterV] = gutters;

  rowStyle.rowGap = gutterV;

  const rowContext = React.useMemo<RowContextState>(
    () => ({ gutter: [gutterH, gutterV] as [number, number], wrap }),
    [gutterH, gutterV, wrap],
  );

  return (
    <RowContext.Provider value={rowContext}>
      <div
        data-slot="row"
        {...others}
        className={classes}
        style={{ ...rowStyle, ...style }}
      >
        {children}
      </div>
    </RowContext.Provider>
  );
};

if (process.env.NODE_ENV !== "production") {
  Row.displayName = "Row";
}

export default Row;

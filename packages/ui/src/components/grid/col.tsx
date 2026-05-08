"use client";

/* eslint-disable unicorn/no-array-for-each */
import * as React from "react";

import { cn } from "@acme/ui/lib/utils";

import type { Breakpoint } from "../_util/responsive-observer";
import type { LiteralUnion } from "../_util/type";
import { ConfigContext } from "../config-provider";
import RowContext from "./row-context";

// https://github.com/ant-design/ant-design/issues/14324
type ColSpanType = number | string;

type FlexType = number | LiteralUnion<"none" | "auto">;

export interface ColSize {
  flex?: FlexType;
  span?: ColSpanType;
  order?: ColSpanType;
  offset?: ColSpanType;
  push?: ColSpanType;
  pull?: ColSpanType;
}

export interface ColProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    Partial<Record<Breakpoint, ColSpanType | ColSize>> {
  flex?: FlexType;
  span?: ColSpanType;
  order?: ColSpanType;
  offset?: ColSpanType;
  push?: ColSpanType;
  pull?: ColSpanType;
  prefixCls?: string;
}

function parseFlex(flex: FlexType): string {
  if (typeof flex === "number") {
    return `${flex} ${flex} auto`;
  }

  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(flex)) {
    return `0 0 ${flex}`;
  }

  return flex;
}
// Map span values (1-24) to Tailwind classes using fraction notation
// Tailwind supports arbitrary fractions like 8/24, 12/24, etc.
const spanToTailwindClass: Record<number, string> = {
  1: "flex-[0_0_auto] basis-1/24 max-w-1/24",
  2: "flex-[0_0_auto] basis-2/24 max-w-2/24",
  3: "flex-[0_0_auto] basis-3/24 max-w-3/24",
  4: "flex-[0_0_auto] basis-4/24 max-w-4/24",
  5: "flex-[0_0_auto] basis-5/24 max-w-5/24",
  6: "flex-[0_0_auto] basis-6/24 max-w-6/24",
  7: "flex-[0_0_auto] basis-7/24 max-w-7/24",
  8: "flex-[0_0_auto] basis-8/24 max-w-8/24",
  9: "flex-[0_0_auto] basis-9/24 max-w-9/24",
  10: "flex-[0_0_auto] basis-10/24 max-w-10/24",
  11: "flex-[0_0_auto] basis-11/24 max-w-11/24",
  12: "flex-[0_0_auto] basis-12/24 max-w-12/24",
  13: "flex-[0_0_auto] basis-13/24 max-w-13/24",
  14: "flex-[0_0_auto] basis-14/24 max-w-14/24",
  15: "flex-[0_0_auto] basis-15/24 max-w-15/24",
  16: "flex-[0_0_auto] basis-16/24 max-w-16/24",
  17: "flex-[0_0_auto] basis-17/24 max-w-17/24",
  18: "flex-[0_0_auto] basis-18/24 max-w-18/24",
  19: "flex-[0_0_auto] basis-19/24 max-w-19/24",
  20: "flex-[0_0_auto] basis-20/24 max-w-20/24",
  21: "flex-[0_0_auto] basis-21/24 max-w-21/24",
  22: "flex-[0_0_auto] basis-22/24 max-w-22/24",
  23: "flex-[0_0_auto] basis-23/24 max-w-23/24",
  24: "flex-[0_0_auto] basis-full max-w-full",
};

const sizes = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;
const Col = (properties: ColProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const {
    span,
    order,
    offset,
    push,
    pull,
    className,
    children,
    flex,
    style,
    ...others
  } = properties;
  const { direction } = React.useContext(ConfigContext);
  const { gutter, wrap } = React.useContext(RowContext);

  // ===================== Size ======================
  const sizeStyle: Record<string, string> = {};

  let sizeClassObject: Record<string, boolean | ColSpanType> = {};
  sizes.forEach((size) => {
    let sizeProperties: ColSize = {};
    const propertySize = properties[size];
    if (typeof propertySize === "number") {
      sizeProperties.span = propertySize;
    } else if (typeof propertySize === "object") {
      sizeProperties = propertySize || {};
    }

    delete others[size];

    sizeClassObject = {
      ...sizeClassObject,
      [`${size}-${sizeProperties.span}`]: sizeProperties.span !== undefined,
      [`${size}-order-${sizeProperties.order}`]:
        sizeProperties.order || sizeProperties.order === 0,
      [`${size}-offset-${sizeProperties.offset}`]:
        sizeProperties.offset || sizeProperties.offset === 0,
      [`${size}-push-${sizeProperties.push}`]:
        sizeProperties.push || sizeProperties.push === 0,
      [`${size}-pull-${sizeProperties.pull}`]:
        sizeProperties.pull || sizeProperties.pull === 0,
      [`rtl`]: direction === "rtl",
    };

    // Responsive flex layout
    if (sizeProperties.flex) {
      sizeClassObject[`${size}-flex`] = true;
      sizeStyle[`--${size}-flex`] = parseFlex(sizeProperties.flex);
    }

    // Responsive span layout - add CSS variable for media queries to use
    if (sizeProperties.span !== undefined) {
      const spanValue =
        typeof sizeProperties.span === "number"
          ? sizeProperties.span
          : Number.parseFloat(String(sizeProperties.span));
      if (!Number.isNaN(spanValue)) {
        const percentage = (spanValue / 24) * 100;
        // Store the percentage as CSS variable that can be used in media queries
        sizeStyle[`--${size}-span-width`] = `${percentage}%`;
      }
    }
  });

  // ==================== Normal =====================
  // Calculate span classes for Tailwind CSS using predefined map
  let spanClasses = "";
  if (span !== undefined) {
    const spanValue =
      typeof span === "number" ? span : Number.parseInt(String(span), 10);
    if (!Number.isNaN(spanValue) && spanValue >= 1 && spanValue <= 24) {
      spanClasses = spanToTailwindClass[spanValue] || "";
    }
  }

  const classes = cn(
    spanClasses,
    {
      // [`${span}`]: span !== undefined,
      [`${order}`]: order,
      [`${offset}`]: offset,
      [`${push}`]: push,
      [`pull-${pull}`]: pull,
    },
    className,
    sizeClassObject,
  );

  const mergedStyle: React.CSSProperties = {};
  // Horizontal gutter use padding
  if (gutter && gutter[0] > 0) {
    const horizontalGutter = gutter[0] / 2;
    mergedStyle.paddingLeft = horizontalGutter;
    mergedStyle.paddingRight = horizontalGutter;
  }

  if (flex) {
    mergedStyle.flex = parseFlex(flex);

    // Hack for Firefox to avoid size issue
    // https://github.com/ant-design/ant-design/pull/20023#issuecomment-564389553
    if (wrap === false && !mergedStyle.minWidth) {
      mergedStyle.minWidth = 0;
    }
  }

  // ==================== Render =====================
  return (
    <div
      data-slot={span ? `col-${span}` : undefined}
      {...others}
      style={{ ...mergedStyle, ...style, ...sizeStyle }}
      className={classes}
    >
      {children}
    </div>
  );
};

if (process.env.NODE_ENV !== "production") {
  Col.displayName = "Col";
}

export default Col;

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable unicorn/no-array-for-each */
import * as React from "react";
import { cn } from "@/lib/utils";

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
  extends React.HTMLAttributes<HTMLDivElement>,
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
const sizes = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;
const Col = React.forwardRef<HTMLDivElement, ColProps>((props, ref) => {
  const { direction } = React.useContext(ConfigContext);
  const { gutter, wrap } = React.useContext(RowContext);

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
  } = props;

  // ===================== Size ======================
  const sizeStyle: Record<string, string> = {};

  let sizeClassObj: Record<string, boolean | ColSpanType> = {};
  sizes.forEach((size) => {
    let sizeProps: ColSize = {};
    const propSize = props[size];
    if (typeof propSize === "number") {
      sizeProps.span = propSize;
    } else if (typeof propSize === "object") {
      sizeProps = propSize || {};
    }

    delete others[size];

    sizeClassObj = {
      ...sizeClassObj,
      [`${size}-${sizeProps.span}`]: sizeProps.span !== undefined,
      [`${size}-order-${sizeProps.order}`]:
        sizeProps.order || sizeProps.order === 0,
      [`${size}-offset-${sizeProps.offset}`]:
        sizeProps.offset || sizeProps.offset === 0,
      [`${size}-push-${sizeProps.push}`]:
        sizeProps.push || sizeProps.push === 0,
      [`${size}-pull-${sizeProps.pull}`]:
        sizeProps.pull || sizeProps.pull === 0,
      [`rtl`]: direction === "rtl",
    };

    // Responsive flex layout
    if (sizeProps.flex) {
      sizeClassObj[`${size}-flex`] = true;
      sizeStyle[`--${size}-flex`] = parseFlex(sizeProps.flex);
    }
  });

  // ==================== Normal =====================
  const classes = cn(
    {
      [`${span}`]: span !== undefined,
      [`${order}`]: order,
      [`${offset}`]: offset,
      [`${push}`]: push,
      [`pull-${pull}`]: pull,
    },
    className,
    sizeClassObj,
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
      {...others}
      style={{ ...mergedStyle, ...style, ...sizeStyle }}
      className={classes}
      ref={ref}
    >
      {children}
    </div>
  );
});

if (process.env.NODE_ENV !== "production") {
  Col.displayName = "Col";
}

export default Col;

// import * as React from "react"
// import { cn } from "@/lib/utils"

// export type ColSize = {
//   span?: number
//   order?: number
//   offset?: number
//   push?: number
//   pull?: number
// }

// export interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
//   span?: number
//   order?: number
//   offset?: number
//   push?: number
//   pull?: number
//   xs?: number | ColSize
//   sm?: number | ColSize
//   md?: number | ColSize
//   lg?: number | ColSize
//   xl?: number | ColSize
//   xxl?: number | ColSize
//   className?: string
//   style?: React.CSSProperties
// }

// const Col = React.forwardRef<HTMLDivElement, ColProps>(
//   (
//     {
//       span,
//       order,
//       offset,
//       push,
//       pull,
//       xs,
//       sm,
//       md,
//       lg,
//       xl,
//       xxl,
//       className,
//       style,
//       children,
//       ...props
//     },
//     ref
//   ) => {
//     const sizeClasses: string[] = []
//     const sizeProps = { xs, sm, md, lg, xl, xxl }

//     // Handle span, order, offset, push, pull for all sizes
//     Object.entries(sizeProps).forEach(([size, sizeProp]) => {
//       if (typeof sizeProp === 'number') {
//         sizeClasses.push(`col-${size}-${sizeProp}`)
//       } else if (sizeProp) {
//         const sizeClass = [`col-${size}-${sizeProp.span || 'auto'}`]
//         if (sizeProp.offset) sizeClass.push(`col-${size}-offset-${sizeProp.offset}`)
//         if (sizeProp.order) sizeClass.push(`col-${size}-order-${sizeProp.order}`)
//         if (sizeProp.push) sizeClass.push(`col-${size}-push-${sizeProp.push}`)
//         if (sizeProp.pull) sizeClass.push(`col-${size}-pull-${sizeProp.pull}`)
//         sizeClasses.push(...sizeClass)
//       }
//     })

//     // Base grid classes
//     const baseClasses = []
//     if (span) {
//       baseClasses.push(`col-span-${span}`)
//     } else if (!xs && !sm && !md && !lg && !xl && !xxl) {
//       // If no size props are provided, default to full width
//       baseClasses.push('flex-1')
//     }

//     // Handle order, offset, push, pull for default size
//     if (order) baseClasses.push(`order-${order}`)
//     if (offset) baseClasses.push(`ml-${offset}/12`)
//     if (push) baseClasses.push(`ml-${push}/12`)
//     if (pull) baseClasses.push(`-ml-${pull}/12`)

//     return (
//       <div
//         ref={ref}
//         className={cn(
//           'relative min-w-0',
//           baseClasses,
//           sizeClasses,
//           className
//         )}
//         style={style}
//         {...props}
//       >
//         {children}
//       </div>
//     )
//   }
// )

// Col.displayName = 'Col'

// export { Col }
// export default Col

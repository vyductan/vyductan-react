/* eslint-disable unicorn/no-for-loop */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import * as React from "react";
import { cn } from "@/lib/utils";

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

function useMergedPropByScreen(
  oriProp: RowProps["align"] | RowProps["justify"],
  screen: ScreenMap | null,
) {
  const [prop, setProp] = React.useState(
    typeof oriProp === "string" ? oriProp : "",
  );

  const calcMergedAlignOrJustify = () => {
    if (typeof oriProp === "string") {
      setProp(oriProp);
    }
    if (typeof oriProp !== "object") {
      return;
    }
    for (let i = 0; i < responsiveArray.length; i++) {
      const breakpoint: Breakpoint = responsiveArray[i]!;
      // if do not match, do nothing
      if (!screen || !screen[breakpoint]) {
        continue;
      }
      const curVal = oriProp[breakpoint];
      if (curVal !== undefined) {
        setProp(curVal);
        return;
      }
    }
  };

  React.useEffect(() => {
    calcMergedAlignOrJustify();
    // eslint-disable-next-line react-hooks/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(oriProp), screen]);

  return prop;
}

const Row = React.forwardRef<HTMLDivElement, RowProps>((props, ref) => {
  const {
    justify,
    align,
    className,
    style,
    children,
    gutter = 0,
    wrap,
    ...others
  } = props;

  const { direction } = React.useContext(ConfigContext);

  const screens = useBreakpoint(true, null);

  const mergedAlign = useMergedPropByScreen(align, screens);
  const mergedJustify = useMergedPropByScreen(justify, screens);

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
    gutters[0] != null && gutters[0] > 0 ? gutters[0] / -2 : undefined;

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
        {...others}
        className={classes}
        style={{ ...rowStyle, ...style }}
        ref={ref}
      >
        {children}
      </div>
    </RowContext.Provider>
  );
});

if (process.env.NODE_ENV !== "production") {
  Row.displayName = "Row";
}

export default Row;

// import * as React from "react"
// import { cn } from "@/lib/utils"

// export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
//   gutter?: number | [number, number]
//   align?: 'top' | 'middle' | 'bottom'
//   justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
//   wrap?: boolean
//   className?: string
//   style?: React.CSSProperties
// }

// const Row = React.forwardRef<HTMLDivElement, RowProps>(
//   (
//     {
//       gutter = 0,
//       align = 'top',
//       justify = 'start',
//       wrap = true,
//       className,
//       style,
//       children,
//       ...props
//     },
//     ref
//   ) => {
//     const [horizontalGutter, verticalGutter] = Array.isArray(gutter) ? gutter : [gutter, 0]

//     const rowStyle: React.CSSProperties = { ...style }

//     // Handle horizontal gutter
//     if (horizontalGutter > 0) {
//       row.marginLeft = horizontalGutter / -2
//       row.marginRight = horizontalGutter / -2
//     }

//     // Handle vertical gutter
//     if (verticalGutter > 0) {
//       row.marginTop = verticalGutter / -2
//       row.marginBottom = verticalGutter / -2
//     }

//     return (
//       <div
//         ref={ref}
//         className={cn(
//           'flex flex-wrap',
//           {
//             'items-start': align === 'top',
//             'items-center': align === 'middle',
//             'items-end': align === 'bottom',
//             'justify-start': justify === 'start',
//             'justify-end': justify === 'end',
//             'justify-center': justify === 'center',
//             'justify-around': justify === 'space-around',
//             'justify-between': justify === 'space-between',
//             'justify-evenly': justify === 'space-evenly',
//             'flex-nowrap': !wrap,
//           },
//           className
//         )}
//         style={rowStyle}
//         {...props}
//       >
//         {React.Children.map(children, (child) => {
//           if (React.isValidElement(child)) {
//             return React.cloneElement(child as React.ReactElement, {
//               style: {
//                 ...(horizontalGutter > 0 && {
//                   paddingLeft: horizontalGutter / 2,
//                   paddingRight: horizontalGutter / 2,
//                 }),
//                 ...(verticalGutter > 0 && {
//                   paddingTop: verticalGutter / 2,
//                   paddingBottom: verticalGutter / 2,
//                 }),
//                 ...child.props.style,
//               },
//             })
//           }
//           return child
//         })}
//       </div>
//     )
//   }
// )

// Row.displayName = 'Row'

// export { Row }
// export default Row

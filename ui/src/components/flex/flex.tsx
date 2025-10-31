import * as React from "react";

import { cn } from "@acme/ui/lib/utils";

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The direction of the flex container
   * @default 'row'
   */
  direction?: "row" | "column" | "row-reverse" | "column-reverse";

  /**
   * Whether to use vertical direction (shorthand for direction="column")
   * @default false
   */
  vertical?: boolean;

  /**
   * The alignment of items along the main axis
   * @default 'start'
   */
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly";

  /**
   * The alignment of items along the cross axis
   * @default 'start'
   */
  align?: React.CSSProperties["alignItems"];

  /**
   * Whether to wrap items when they overflow
   * @default false
   */
  wrap?: boolean | "wrap" | "nowrap" | "wrap-reverse";

  /**
   * The gap between items
   * @default 0
   */
  gap?: number | string;

  /**
   * The content of the flex container
   */
  children?: React.ReactNode;

  /**
   * Custom class name for the flex container
   */
  className?: string;

  /**
   * Custom style for the flex container
   */
  style?: React.CSSProperties;

  /**
   * Whether the flex container should be inline
   * @default false
   */
  inline?: boolean;
}

/**
 * A flexible layout component that provides a simple way to create flexbox layouts.
 * Similar to Ant Design's Flex component but with enhanced TypeScript support.
 */
const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction = "row",
      vertical = false,
      justify = "start",
      align = "start",
      wrap = false,
      gap = 0,
      children,
      className,
      style,
      inline = false,
      ...props
    },
    ref,
  ) => {
    const gapValue = typeof gap === "number" ? `${gap}px` : gap;

    const mergedStyle: React.CSSProperties = {
      gap: gapValue,
      ...style,
    };

    // Determine the actual direction based on vertical prop
    const actualDirection = vertical ? "column" : direction;

    const classes = cn(
      inline ? "inline-flex" : "flex",
      "gap-2",
      {
        // Direction
        "flex-row": actualDirection === "row",
        "flex-col": actualDirection === "column",
        "flex-row-reverse": actualDirection === "row-reverse",
        "flex-col-reverse": actualDirection === "column-reverse",

        // Justify content
        "justify-start": justify === "start",
        "justify-end": justify === "end",
        "justify-center": justify === "center",
        "justify-between": justify === "between",
        "justify-around": justify === "around",
        "justify-evenly": justify === "evenly",

        // Align items
        "items-start": align === "start",
        "items-end": align === "end",
        "items-center": align === "center",
        "items-baseline": align === "baseline",
        "items-stretch": align === "stretch",

        // Wrap
        "flex-wrap": wrap === true || wrap === "wrap",
        "flex-nowrap": wrap === "nowrap",
        "flex-wrap-reverse": wrap === "wrap-reverse",
      },
      className,
    );

    return (
      <div ref={ref} className={classes} style={mergedStyle} {...props}>
        {children}
      </div>
    );
  },
);

Flex.displayName = "Flex";

export { Flex };
export type { FlexProps };

import * as React from "react";

import { cn } from "@acme/ui/lib/utils";

interface SpaceProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * The direction of the space
   * @default 'horizontal'
   */
  direction?: "horizontal" | "vertical";

  /**
   * The size of the space
   * @default 'middle'
   */
  size?: "small" | "middle" | "large" | number;

  /**
   * The alignment of the items in the space
   * @default 'center'
   */
  align?: "start" | "end" | "center" | "baseline";

  /**
   * Whether to wrap items when they overflow
   * @default false
   */
  wrap?: boolean;

  /**
   * The content of the space
   */
  children?: React.ReactNode;

  /**
   * Custom class name for the space
   */
  className?: string;

  /**
   * Custom style for the space
   */
  style?: React.CSSProperties;

  /**
   * Split the space with a custom node
   */
  split?: React.ReactNode;
}

const sizeMap = {
  small: 8,
  middle: 16,
  large: 24,
} as const;

/**
 * A component for creating consistent spacing between elements.
 * Follows Ant Design's Space API but with Shadcn UI styling.
 */
const Space = React.forwardRef<HTMLDivElement, SpaceProps>(
  (
    {
      direction = "horizontal",
      size = "middle",
      align = "center",
      wrap = false,
      children,
      className,
      style,
      split,
      ...props
    },
    ref,
  ) => {
    const gap = typeof size === "number" ? size : sizeMap[size];

    const mergedStyle: React.CSSProperties = {
      gap: `${gap}px`,
      ...style,
    };

    const classes = cn(
      "flex",
      {
        "flex-row": direction === "horizontal",
        "flex-col": direction === "vertical",
        "flex-wrap": wrap,
        "items-start": align === "start",
        "items-end": align === "end",
        "items-center": align === "center",
        "items-baseline": align === "baseline",
      },
      className,
    );

    const childNodes = React.Children.toArray(children);
    const nodes = childNodes.map((child, i) => {
      const key =
        (child && typeof child === "object" && "key" in child
          ? child.key
          : null) ?? i;

      return (
        <React.Fragment key={key}>
          {i > 0 && split && (
            <span className="inline-flex items-center" aria-hidden>
              {split}
            </span>
          )}
          <div className="inline-flex">{child}</div>
        </React.Fragment>
      );
    });

    return (
      <div ref={ref} className={classes} style={mergedStyle} {...props}>
        {nodes}
      </div>
    );
  },
);

Space.displayName = "Space";

export { Space };
export type { SpaceProps };

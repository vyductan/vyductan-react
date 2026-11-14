import type { CSSProperties, ReactNode } from "react";

import { cn } from "@acme/ui/lib/utils";

/**
 * Semantic parts, named as AntD's Timeline names them (v6 `classNames` /
 * `styles`). AntD has no `size` prop: spacing between items is the item's
 * bottom padding (its `itemPaddingBottom` token, 20px here as `pb-5`), so a
 * denser timeline passes e.g. `classNames={{ item: "pb-3" }}`.
 */
type TimelineSemanticPart =
  | "root"
  | "item"
  | "itemRail"
  | "itemIcon"
  | "itemContent";

type TimelineProperties = {
  items: {
    children: ReactNode;
    label?: ReactNode;
    color?: string;
    dot?: ReactNode;
  }[];
  className?: string;
  classNames?: Partial<Record<TimelineSemanticPart, string>>;
  styles?: Partial<Record<TimelineSemanticPart, CSSProperties>>;
};
export const Timeline = ({
  items,
  className,
  classNames,
  styles,
}: TimelineProperties) => {
  return (
    <ul className={cn(className, classNames?.root)} style={styles?.root}>
      {items.map((x, index) => {
        return (
          <li
            key={index}
            className={cn("relative", "pb-5", classNames?.item)}
            style={styles?.item}
          >
            <div
              className={cn("absolute border-s-2", classNames?.itemRail)}
              style={{
                insetBlockStart: 10,
                insetInlineStart: "calc((10px - 2px) / 2)",
                height: "calc(100% - 10px)",
                ...styles?.itemRail,
              }}
            />

            <div
              className={cn(
                "absolute",
                "flex -translate-x-1/2 -translate-y-1/2 bg-background py-1",
                classNames?.itemIcon,
              )}
              style={{
                insetBlockStart: "calc(10px / 2)",
                insetInlineStart: "calc(10px / 2)",
                ...styles?.itemIcon,
              }}
            >
              {x.dot ?? (
                <span className="size-2.5 rounded-full bg-foreground" />
              )}
            </div>
            <div
              className={cn("relative ml-6", classNames?.itemContent)}
              style={{ insetBlockStart: -6, ...styles?.itemContent }}
            >
              {x.children}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

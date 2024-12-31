import type { ReactNode } from "react";

import { cn } from "..";

type TimelineProps = {
  items: {
    children: ReactNode;
    label?: ReactNode;
    color?: string;
    dot?: ReactNode;
  }[];
};
export const Timeline = ({ items }: TimelineProps) => {
  return (
    <ul>
      {items.map((x, index) => {
        return (
          <li
            key={index}
            className={cn(
              "relative",
              "pb-5",
              // "relative grid gap-10 pl-6 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-muted-foreground/20",
            )}
          >
            <div
              className="absolute border-s-2"
              style={{
                insetBlockStart: 10,
                insetInlineStart: "calc((10px - 2px) / 2)",
                height: "calc(100% - 10px)",
              }}
            />

            <div
              className={cn(
                "absolute",
                "flex -translate-x-1/2 -translate-y-1/2 bg-white py-1",
                // x.dot ? "bg-white py-1" : "size-2.5 rounded-full bg-gray-800",
              )}
              style={{
                insetBlockStart: "calc(10px / 2)",
                insetInlineStart: "calc(10px / 2)",
                // height: "calc(100% - 10px)",
              }}
            >
              {x.dot ?? <span className="size-2.5 rounded-full bg-gray-800" />}
            </div>
            <div className="relative ml-6" style={{ insetBlockStart: -6 }}>
              {x.children}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

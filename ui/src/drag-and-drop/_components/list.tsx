// https://github.com/clauderic/dnd-kit/blob/master/stories/components/List/List.tsx
// 2020-12-31T18:02:04.000Z
import React, { forwardRef } from "react";

import { cn } from "../..";

export interface Props {
  children: React.ReactNode;
  columns?: number;
  style?: React.CSSProperties;
  horizontal?: boolean;
  className?: string;
}

export const List = forwardRef<HTMLUListElement, Props>(
  ({ children, columns = 1, horizontal, style, className }: Props, ref) => {
    return (
      <ul
        ref={ref}
        // style={
        //   {
        //     ...style,
        //     '--columns': columns,
        //   } as React.CSSProperties
        // }
        style={{
          ...style,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
        className={cn(
          "grid w-full auto-rows-max gap-2 rounded-md",
          horizontal && "grid-flow-col",
          className,
        )}
      >
        {children}
      </ul>
    );
  },
);

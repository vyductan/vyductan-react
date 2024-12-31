import type { CSSProperties } from "react";
import React, { forwardRef } from "react";

import { cn } from "../..";

export interface ActionProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties["cursor"];
}

export const Action = forwardRef<HTMLButtonElement, ActionProps>(
  ({ active: _, className, cursor, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={cn(
          "flex w-3 touch-none appearance-none rounded-md bg-transparent",
          className,
        )}
        tabIndex={0}
        style={
          {
            ...style,
            cursor,
            // "--fill": active?.fill,
            // "--background": active?.background,
          } as CSSProperties
        }
      />
    );
  },
);

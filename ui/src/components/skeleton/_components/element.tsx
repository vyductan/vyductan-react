import React from "react";
import { cn } from "@/lib/utils";

import { Skeleton as SkeletonShadcn } from "@acme/ui/shadcn/skeleton";

export interface SkeletonElementProps {
  className?: string;
  rootClassName?: string;
  style?: React.CSSProperties;
  size?: "large" | "small" | "default" | number;
  shape?: "circle" | "square" | "round" | "default";
  active?: boolean;
}

const SkeletonElement = (props: SkeletonElementProps) => {
  const { active, className, style, size, shape } = props;

  const sizeCls = cn({
    ["h-10 w-10"]: size === "large",
    ["h-12 w-12"]: size === "small",
  });

  const shapeCls = cn({
    ["rounded-full"]: shape === "circle",
    ["rounded-md"]: shape === "square",
    ["rounded-lg"]: shape === "round",
  });

  const sizeStyle = React.useMemo<React.CSSProperties>(
    () =>
      typeof size === "number"
        ? {
            width: size,
            height: size,
            lineHeight: `${size}px`,
          }
        : {},
    [size],
  );

  return (
    <SkeletonShadcn
      className={cn(active ? "" : "animate-none", sizeCls, shapeCls, className)}
      style={{ ...sizeStyle, ...style }}
    />
  );
};

export { SkeletonElement };

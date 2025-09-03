import React from "react";
import { cn } from "@/lib/utils";

import { Skeleton as SkeletonShadcn } from "@acme/ui/shadcn/skeleton";

import { GenericSlot } from "../../slot";

export interface SkeletonElementProps {
  className?: string;
  rootClassName?: string;
  style?: React.CSSProperties;
  size?: "large" | "small" | "default" | number;
  shape?: "circle" | "square" | "round" | "default";
  active?: boolean;
  asChild?: boolean;
  children?: React.ReactNode;
}

const SkeletonElement = (props: SkeletonElementProps) => {
  const { active, className, style, size, shape, asChild, ...restProps } =
    props;

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

  const Slot = asChild ? GenericSlot : SkeletonShadcn;

  return (
    <Slot
      data-slot="skeleton"
      className={cn(
        "h-4 w-full",
        "bg-accent animate-pulse rounded-md",
        active ? "" : "animate-none",
        sizeCls,
        shapeCls,
        className,
      )}
      // className={cn(active ? "" : "animate-none", sizeCls, shapeCls, className)}
      style={{ ...sizeStyle, ...style }}
      {...restProps}
    />
  );
};

export { SkeletonElement };

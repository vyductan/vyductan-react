"use client";

import type { SkeletonElementProps as SkeletonElementProperties } from "./element";
import { SkeletonElement } from "./element";

export interface SkeletonAvatarProps extends Omit<
  SkeletonElementProperties,
  "shape"
> {
  shape?: "circle" | "square";
}

const SkeletonAvatar = (properties: SkeletonAvatarProps) => {
  const { shape = "circle", size = "default", ...restProperties } = properties;
  return <SkeletonElement shape={shape} size={size} {...restProperties} />;
};

export { SkeletonAvatar };

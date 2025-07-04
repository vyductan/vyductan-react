"use client";

import type { SkeletonElementProps } from "./element";
import { SkeletonElement } from "./element";

export interface SkeletonAvatarProps
  extends Omit<SkeletonElementProps, "shape"> {
  shape?: "circle" | "square";
}

const SkeletonAvatar = (props: SkeletonAvatarProps) => {
  const { shape = "circle", size = "default", ...restProps } = props;
  return <SkeletonElement shape={shape} size={size} {...restProps} />;
};

export { SkeletonAvatar };

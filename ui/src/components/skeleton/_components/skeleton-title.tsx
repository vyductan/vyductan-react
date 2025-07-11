import * as React from "react";

import { SkeletonElement } from "./element";

export interface SkeletonTitleProps {
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  active?: boolean;
}

const SkeletonTitle: React.FC<SkeletonTitleProps> = ({
  className,
  width,
  style,
  active,
}) => (
  // biome-ignore lint/a11y/useHeadingContent: HOC here
  <SkeletonElement active={active} asChild>
    <h3
      data-slot="skeleton-title"
      className={className}
      style={{ width, ...style }}
    />
  </SkeletonElement>
);

export { SkeletonTitle };

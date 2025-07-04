import * as React from "react";

export interface SkeletonTitleProps {
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
}

const SkeletonTitle: React.FC<SkeletonTitleProps> = ({
  className,
  width,
  style,
}) => (
  // biome-ignore lint/a11y/useHeadingContent: HOC here
  <h3 className={className} style={{ width, ...style }} />
);

export { SkeletonTitle };

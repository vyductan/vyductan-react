import type * as React from "react";

import { cn } from "@acme/ui/lib/utils";

import { SkeletonElement } from "./element";

type widthUnit = number | string;

export interface SkeletonParagraphProps {
  className?: string;
  style?: React.CSSProperties;
  width?: widthUnit | Array<widthUnit>;
  rows?: number;
  active?: boolean;
}

const getWidth = (index: number, properties: SkeletonParagraphProps) => {
  const { width, rows = 2 } = properties;
  if (Array.isArray(width)) {
    return width[index];
  }
  // last paragraph
  if (rows - 1 === index) {
    return width;
  }
  return undefined;
};

const SkeletonParagraph: React.FC<SkeletonParagraphProps> = ({
  active,
  ...properties
}) => {
  const { className, style, rows = 0 } = properties;
  const rowList = Array.from({ length: rows }).map((_, index) => (
    <SkeletonElement
      active={active}
      asChild
      key={index}
      style={{ width: getWidth(index, properties) }}
    >
      <li />
    </SkeletonElement>
  ));
  return (
    <ul
      data-slot="skeleton-paragraph"
      className={cn("space-y-4", className)}
      style={style}
    >
      {rowList}
    </ul>
  );
};

export { SkeletonParagraph };

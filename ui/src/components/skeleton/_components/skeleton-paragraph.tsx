/* eslint-disable unicorn/no-useless-undefined */
import * as React from "react";

type widthUnit = number | string;

export interface SkeletonParagraphProps {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: widthUnit | Array<widthUnit>;
  rows?: number;
}

const getWidth = (index: number, props: SkeletonParagraphProps) => {
  const { width, rows = 2 } = props;
  if (Array.isArray(width)) {
    return width[index];
  }
  // last paragraph
  if (rows - 1 === index) {
    return width;
  }
  return undefined;
};

const SkeletonParagraph: React.FC<SkeletonParagraphProps> = (props) => {
  const { className, style, rows = 0 } = props;
  const rowList = Array.from({ length: rows }).map((_, index) => (
    <li key={index} style={{ width: getWidth(index, props) }} />
  ));
  return (
    <ul className={className} style={style}>
      {rowList}
    </ul>
  );
};

export { SkeletonParagraph };

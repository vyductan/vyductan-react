import type { ReactNode } from "react";

export type DescriptionsItem = {
  key?: React.Key;
  label?: React.ReactNode;
  children?: React.ReactNode;

  span?: number;
  className?: string;
  classNames?: {
    label?: string;
    children?: string;
  };
};

export type VerticalCell = {
  content: ReactNode;
  span?: number;
  className?: string;
};
export type VerticalRow = VerticalCell[];

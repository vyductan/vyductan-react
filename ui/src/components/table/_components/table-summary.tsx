import type React from "react";

export interface SummaryProps {
  fixed?: boolean | "top" | "bottom";
  children?: React.ReactNode;
}

/**
 * Syntactic sugar. Do not support HOC.
 */
export function TableSummary({ children }: SummaryProps) {
  return children as React.ReactElement;
}

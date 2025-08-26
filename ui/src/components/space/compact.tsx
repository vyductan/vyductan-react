import React from "react";
import { cn } from "@/lib/utils";

import type { DirectionType } from "../config-provider/context";
import type { SizeType } from "../config-provider/size-context";

export interface SpaceCompactItemContextType {
  compactSize?: SizeType;
  compactDirection?: "horizontal" | "vertical";
  isFirstItem?: boolean;
  isLastItem?: boolean;
}

export const SpaceCompactItemContext =
  React.createContext<SpaceCompactItemContextType | null>(null);

export const useCompactItemContext = (direction: DirectionType) => {
  const compactItemContext = React.useContext(SpaceCompactItemContext);

  const compactItemClassnames = React.useMemo<string>(() => {
    if (!compactItemContext) {
      return "";
    }
    const { compactDirection, isFirstItem, isLastItem } = compactItemContext;

    return cn(
      // Base styles for compact item
      "relative inline-flex items-center justify-center",
      // RTL support
      direction === "rtl" ? "[direction:rtl]" : "",
      // First item styles
      isFirstItem && compactDirection === "horizontal" && "rounded-r-none",
      isFirstItem && compactDirection === "vertical" && "rounded-b-none",
      // Last item styles
      isLastItem && compactDirection === "horizontal" && "rounded-l-none",
      isLastItem && compactDirection === "vertical" && "rounded-t-none",
      // Middle item styles
      !isFirstItem &&
        !isLastItem &&
        compactDirection === "horizontal" &&
        "rounded-none",
      !isFirstItem &&
        !isLastItem &&
        compactDirection === "vertical" &&
        "rounded-none",
      // Hover/focus states
      "hover:z-[2] focus:z-[2] focus-visible:z-[2]",
    );
  }, [direction, compactItemContext]);

  return {
    compactSize: compactItemContext?.compactSize,
    compactDirection: compactItemContext?.compactDirection,
    compactItemClassnames,
  };
};

import React from "react";
import { cn } from "@/lib/utils";

import type { DirectionType } from "../config-provider/context";
import type { SizeType } from "../config-provider/size-context";
import { ButtonGroup } from "../../shadcn/button-group";

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

interface SpaceCompactProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Compact size forwarded to items via context
   */
  size?: SizeType;
  /**
   * Orientation of the compact group
   * @default "horizontal"
   */
  direction?: "horizontal" | "vertical";
  /**
   * Fit width to its parent's width
   * @default false
   */
  block?: boolean;
  /**
   * Children to compact
   */
  children?: React.ReactNode;
}

/**
 * Space.Compact – groups controls tightly with connected borders using ButtonGroup styles.
 */
const SpaceCompact = React.forwardRef<HTMLDivElement, SpaceCompactProps>(
  (
    {
      size,
      direction = "horizontal",
      block = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const childNodes = React.Children.toArray(children);

    return (
      <ButtonGroup
        ref={ref as unknown as React.Ref<HTMLDivElement>}
        orientation={direction}
        className={cn(block && "w-full", className)}
        {...props}
      >
        {childNodes.map((child, index) => {
          const isFirstItem = index === 0;
          const isLastItem = index === childNodes.length - 1;

          const contextValue: SpaceCompactItemContextType = {
            compactSize: size,
            compactDirection: direction,
            isFirstItem,
            isLastItem,
          };

          const key = index;

          return (
            <SpaceCompactItemContext.Provider value={contextValue} key={key}>
              {child as React.ReactNode}
            </SpaceCompactItemContext.Provider>
          );
        })}
      </ButtonGroup>
    );
  },
);

SpaceCompact.displayName = "SpaceCompact";

export { SpaceCompact };

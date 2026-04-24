import { useMemo } from "react";

import { cn } from "@acme/ui/lib/utils";

import type { RenderNode } from "../types";
import { Icon } from "../../../icons";

type SelectClearProperties = React.ComponentProps<"span"> & {
  allowClear?: boolean | { clearIcon?: RenderNode };
  showClearIcon?: boolean;
  onClear?: () => void;
};
const SelectClear = ({
  allowClear,
  showClearIcon,
  className,
  onPointerDown,
  onClear,
  ...restProperties
}: SelectClearProperties) => {
  const mergedClearIcon = useMemo(() => {
    if (typeof allowClear === "object") {
      return allowClear.clearIcon;
    }
  }, [allowClear]);

  const icon =
    typeof mergedClearIcon === "function"
      ? mergedClearIcon({})
      : mergedClearIcon;

  return (
    <span
      role="button"
      data-slot="select-clear"
      aria-label="Remove"
      tabIndex={showClearIcon ? 0 : -1}
      className={cn(
        "z-10",
        "absolute right-[11px]",
        "flex size-5 items-center justify-center transition-opacity",
        "opacity-0",
        !showClearIcon && "pointer-events-none",
        showClearIcon && "hover:opacity-50!",
        showClearIcon && "group-hover:opacity-30",
        className,
      )}
      onPointerDown={(e) => {
        if (!showClearIcon) return;
        e.preventDefault();
        e.stopPropagation();
        onPointerDown?.(e);
      }}
      onKeyDown={(e) => {
        if (!showClearIcon) return;
        if (e.key !== "Enter" && e.key !== " ") return;

        e.preventDefault();
        e.stopPropagation();
        onClear?.();
      }}
      {...restProperties}
    >
      {icon === undefined ? (
        <Icon
          icon="icon-[ant-design--close-circle-filled]"
          className="pointer-events-none size-3.5"
        />
      ) : (
        icon
      )}
    </span>
  );
};

export type { SelectClearProperties as SelectClearProps };
export { SelectClear };

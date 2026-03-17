import { useMemo } from "react";

import { cn } from "@acme/ui/lib/utils";

import type { RenderNode } from "../types";
import { Icon } from "../../../icons";

type SelectClearProps = React.ComponentProps<"span"> & {
  allowClear?: boolean | { clearIcon?: RenderNode };
  showClearIcon?: boolean;
};
const SelectClear = ({
  allowClear,
  showClearIcon,
  onPointerDown,
}: SelectClearProps) => {
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
      data-slot="select-clear"
      className={cn(
        "z-10",
        "absolute right-[11px]",
        "flex size-5 items-center justify-center transition-opacity",
        "opacity-0",
        // When there is no value, make the clear icon non-interactive so it doesn't block the trigger/arrow
        !showClearIcon && "pointer-events-none",
        showClearIcon && "hover:opacity-50!",
        showClearIcon && "group-hover:opacity-30",
      )}
      onPointerDown={(e) => {
        // If there's no value, don't intercept the click
        if (!showClearIcon) return;
        e.preventDefault();
        e.stopPropagation();
        onPointerDown?.(e);
      }}
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

export type { SelectClearProps };
export { SelectClear };

import { useMemo } from "react";
import { cn } from "@/lib/utils";

import type { ValueType } from "../../form";
import type { RenderNode } from "../types";
import { Icon } from "../../../icons";

type SelectClearProps = React.ComponentProps<"span"> & {
  allowClear?: boolean | { clearIcon?: RenderNode };
  /**
   * Clear all icon
   * @deprecated Please use `allowClear` instead
   **/
  clearIcon?: RenderNode;

  value?: ValueType;
};
const SelectClear = ({
  allowClear,
  clearIcon,
  value,

  onPointerDown,
}: SelectClearProps) => {
  const mergedClearIcon = useMemo(() => {
    if (typeof allowClear === "object") {
      return allowClear.clearIcon;
    }
    if (clearIcon) {
      return clearIcon;
    }
  }, [allowClear, clearIcon]);

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
        !value && "pointer-events-none",
        value && "hover:opacity-50!",
        value && "group-hover:opacity-30",
      )}
      onPointerDown={(e) => {
        // If there's no value, don't intercept the click
        if (!value) return;
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

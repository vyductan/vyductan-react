import { useMemo } from "react";

import { cn } from "@acme/ui/lib/utils";

import type { RenderNode } from "../../select/types";
import { Icon } from "../../../icons";

type ComboboxClearProperties = React.ComponentProps<"button"> & {
  allowClear?: boolean | { clearIcon?: RenderNode };
  showClearIcon?: boolean;
  onClear?: () => void;
};

const ComboboxClear = ({
  allowClear,
  showClearIcon,
  className,
  onPointerDown,
  onClear,
  ...restProperties
}: ComboboxClearProperties) => {
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
    <button
      type="button"
      data-slot="combobox-clear"
      aria-label="Remove"
      tabIndex={showClearIcon ? 0 : -1}
      className={cn(
        "z-10",
        "absolute right-[11px]",
        "flex size-5 items-center justify-center rounded-full transition-opacity",
        "opacity-0",
        !showClearIcon && "pointer-events-none",
        showClearIcon && "group-hover/input-group:opacity-30",
        showClearIcon && "hover:opacity-50!",
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
    </button>
  );
};

export type { ComboboxClearProperties as ComboboxClearProps };
export { ComboboxClear };

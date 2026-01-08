import type * as React from "react";

import { cn } from "@acme/ui/lib/utils";

import { Icon } from "../../../icons";

interface ClearIconProps {
  visible?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export const ClearIcon = ({
  visible = true,
  onClick,
  className,
  ref,
}: ClearIconProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  if (!visible) return null;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        "flex size-4 items-center justify-center",
        "opacity-30 hover:opacity-50",
        "transition-opacity",
        className,
      )}
    >
      <Icon
        icon="icon-[ant-design--close-circle-filled]"
        className="pointer-events-none size-4"
      />
    </button>
  );
};

ClearIcon.displayName = "ClearIcon";

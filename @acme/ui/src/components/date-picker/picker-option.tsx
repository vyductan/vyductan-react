import type * as React from "react";

import { cn } from "@acme/ui/lib/utils";

type PickerOptionProperties = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onHover?: () => void;
  onSelect?: () => void;
};

const PickerOption = ({
  children,
  className,
  disabled = false,
  onHover,
  onSelect,
}: PickerOptionProperties) => {
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    onSelect?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    onSelect?.();
  };

  return (
    <div
      className={cn(
        "rounded-md p-2 text-center transition-colors",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-accent hover:text-accent-foreground cursor-pointer",
        className,
      )}
      onMouseEnter={() => {
        if (disabled) return;
        onHover?.();
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      role="button"
      aria-disabled={disabled ? true : undefined}
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </div>
  );
};

export { PickerOption };

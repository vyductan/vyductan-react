"use client";

import * as React from "react";

import type { Color } from "./color";
import type { ColorPickerProps } from "./types";
import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { ColorPickerPanel } from "./color-picker-panel";

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  defaultValue,
  onChange,
  onOpenChange,
  open,
  disabled = false,
  size = "middle",
  format = "hex",
  showText = false,
  allowClear = false,
  presets = [],
  trigger = "click",
  placement = "bottomLeft",
  className,
  style,
  children,
  ...props
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<Color | undefined>(
    value ?? defaultValue ?? undefined,
  );

  const isControlled = open !== undefined;
  const isValueControlled = value !== undefined;

  const currentOpen = isControlled ? open : internalOpen;
  const currentValue = isValueControlled ? value : internalValue;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handleChange = (color: Color) => {
    if (!isValueControlled) {
      setInternalValue(color);
    }
    onChange?.(color);
  };

  const handleClear = () => {
    if (!isValueControlled) {
      setInternalValue(undefined);
    }
    onChange?.();
  };

  const displayValue = currentValue?.toHexString() ?? "#000000";
  const displayText = showText ? displayValue : "";

  const triggerElement = children ?? (
    <Button
      variant="outline"
      size={size}
      disabled={disabled}
      className={cn(
        "border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 border p-0",
        className,
      )}
      style={{
        backgroundColor: displayValue,
        ...style,
      }}
      {...props}
    >
      {showText && (
        <span className="text-foreground/70 text-xs">{displayText}</span>
      )}
    </Button>
  );

  return (
    <Popover
      open={currentOpen}
      onOpenChange={handleOpenChange}
      placement={placement as any}
      trigger={trigger}
    >
      <PopoverTrigger asChild disabled={disabled}>
        {triggerElement}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <ColorPickerPanel
          value={currentValue}
          onChange={handleChange}
          onClear={allowClear ? handleClear : undefined}
          format={format}
          presets={presets}
        />
      </PopoverContent>
    </Popover>
  );
};

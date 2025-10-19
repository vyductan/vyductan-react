"use client";

import type * as React from "react";
import { useControlledState } from "@rc-component/util";

import type { ColorPickerProps } from "./types";
import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { AggregationColor } from "./color";
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
  // const [internalOpen, setInternalOpen] = React.useState(false);
  const [internalValue, setInternalValue] = useControlledState(
    defaultValue,
    value,
  );
  const color =
    internalValue instanceof AggregationColor
      ? internalValue
      : new AggregationColor(internalValue ?? "#000000");

  const handleChange = (color: AggregationColor) => {
    setInternalValue(color);
    onChange?.(color);
  };

  const handleClear = () => {
    setInternalValue(undefined);
    onChange?.();
  };

  const displayValue = color.toHexString();
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
      open={open}
      onOpenChange={onOpenChange}
      placement={placement}
      trigger={trigger}
    >
      <PopoverTrigger asChild disabled={disabled}>
        {triggerElement}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <ColorPickerPanel
          value={color}
          onChange={handleChange}
          onClear={allowClear ? handleClear : undefined}
          format={format}
          presets={presets}
        />
      </PopoverContent>
    </Popover>
  );
};

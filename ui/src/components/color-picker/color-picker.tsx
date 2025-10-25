"use client";

import type * as React from "react";
import { useControlledState } from "@rc-component/util";

import type { ColorPickerProps } from "./types";
import { Button } from "../button";
import { Popover } from "../popover";
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
  format,
  showText = false,
  allowClear = false,
  presets = [],
  trigger = "click",
  placement = "bottomLeft",
  children,
  ...props
}) => {
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

    const formatedColor =
      format === "hex" ? color.toHexString() : color.toRgbString();

    onChange?.(color, formatedColor);
  };

  const handleClear = () => {
    setInternalValue(undefined);
    onChange?.(
      undefined as unknown as AggregationColor,
      undefined as unknown as string,
    );
  };

  const displayValue = color.toHexString();
  const displayText = showText ? displayValue : "";

  const triggerElement = children ?? (
    <Button
      variant="outline"
      size={size}
      disabled={disabled}
      data-slot="color-picker-trigger"
      shape="icon"
      {...props}
    >
      <div
        data-slot="color-picker-color-block"
        style={{
          backgroundColor: displayValue,
        }}
        className="w-control-sm h-control-sm rounded-sm"
      >
        {showText && (
          <span className="text-foreground/70 text-xs">{displayText}</span>
        )}
      </div>
    </Button>
  );

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      placement={placement}
      trigger={trigger}
      content={
        <ColorPickerPanel
          hexValue={color.toHexString()}
          onChange={(hexValue) => {
            handleChange(new AggregationColor(hexValue));
          }}
          onClear={allowClear ? handleClear : undefined}
          presets={presets}
        />
      }
      className="w-auto p-0"
    >
      {triggerElement}
    </Popover>
  );
};

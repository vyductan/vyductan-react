"use client";

import type * as React from "react";
import { useEffect, useState } from "react";

import type { OKLCHColor } from "./color";
import type { ColorPickerOKLCHPanelProps } from "./types";
import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Input } from "../input";
import { AggregationColor } from "./color";
import { OKLCHSlider } from "./oklch-slider";

export const ColorPickerOKLCHPanel: React.FC<ColorPickerOKLCHPanelProps> = ({
  oklchValue = { l: 0.5, c: 0.1, h: 180, alpha: 1 },
  onChange,
  onClear,
  presets = [],
  showAlpha = false,
  className,
  ...props
}) => {
  const [inputValue, setInputValue] = useState("");

  // Convert OKLCH to hex for display
  const currentColor = AggregationColor.fromOKLCH(oklchValue);
  const hexValue = currentColor.toHexString();

  useEffect(() => {
    setInputValue(hexValue);
  }, [hexValue]);

  const handleSliderChange = (channel: keyof OKLCHColor, value: number) => {
    const newOklch = { ...oklchValue, [channel]: value };
    onChange?.(newOklch);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    try {
      const color = new AggregationColor(newValue);
      const oklch = color.toOKLCH();
      onChange?.(oklch);
    } catch {
      // Invalid color, keep the input value but don't update the color
    }
  };

  const handleInputBlur = (newValue: string) => {
    try {
      const color = new AggregationColor(newValue);
      const oklch = color.toOKLCH();
      onChange?.(oklch);
    } catch {
      // Invalid color, revert to current hex value
      setInputValue(hexValue);
    }
  };

  const handlePresetClick = (presetColor: string) => {
    try {
      const color = new AggregationColor(presetColor);
      const oklch = color.toOKLCH();
      onChange?.(oklch);
    } catch {
      // Invalid color, ignore
    }
  };

  const handleClear = () => {
    onClear?.();
  };

  return (
    <div className={cn("space-y-4 p-4", className)} {...props}>
      {/* Color Display */}
      <div className="flex items-center space-x-3">
        <div
          className="border-border h-8 w-8 rounded border"
          style={{ backgroundColor: hexValue }}
        />
        <div className="flex-1">
          <Input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={(e) => handleInputBlur(e.target.value)}
            placeholder="Enter color"
            className="text-sm"
          />
        </div>
        {onClear && (
          <Button
            variant="text"
            size="small"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </div>

      {/* OKLCH Sliders */}
      <div className="space-y-3">
        <OKLCHSlider
          l={oklchValue.l}
          c={oklchValue.c}
          h={oklchValue.h}
          alpha={oklchValue.alpha}
          channel="l"
          onChange={(value) => handleSliderChange("l", value)}
        />
        <OKLCHSlider
          l={oklchValue.l}
          c={oklchValue.c}
          h={oklchValue.h}
          alpha={oklchValue.alpha}
          channel="c"
          onChange={(value) => handleSliderChange("c", value)}
        />
        <OKLCHSlider
          l={oklchValue.l}
          c={oklchValue.c}
          h={oklchValue.h}
          alpha={oklchValue.alpha}
          channel="h"
          onChange={(value) => handleSliderChange("h", value)}
        />
        {showAlpha && (
          <OKLCHSlider
            l={oklchValue.l}
            c={oklchValue.c}
            h={oklchValue.h}
            alpha={oklchValue.alpha}
            channel="alpha"
            onChange={(value) => handleSliderChange("alpha", value)}
          />
        )}
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Presets</label>
          <div className="grid grid-cols-8 gap-1">
            {presets.map((preset: string, index: number) => (
              <button
                key={index}
                className="border-border h-6 w-6 rounded border transition-transform hover:scale-110"
                style={{ backgroundColor: preset }}
                onClick={() => handlePresetClick(preset)}
                title={preset}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

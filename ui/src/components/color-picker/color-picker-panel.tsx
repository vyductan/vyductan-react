"use client";

import type * as React from "react";
import { useEffect, useState } from "react";
import { HexAlphaColorPicker } from "react-colorful";

import type { ColorPickerPanelProps } from "./types";
import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Input } from "../input";
import { AggregationColor } from "./color";

export const ColorPickerPanel: React.FC<ColorPickerPanelProps> = ({
  hexValue,
  onChange,
  onClear,
  presets = [],
  className,
  ...props
}) => {
  const [inputValue, setInputValue] = useState(hexValue);
  useEffect(() => {
    setInputValue(hexValue);
  }, [hexValue]);

  const handlePickerChange = (nextColor: string) => {
    onChange?.(nextColor);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    try {
      new AggregationColor(newValue);
      onChange?.(newValue);
    } catch {
      // Invalid color, keep the input value but don't update the color
    }
  };

  const handleInputBlur = (newValue: string) => {
    try {
      new AggregationColor(newValue);
      onChange?.(newValue);
    } catch {
      // Invalid color, keep the input value but don't update the color
    }
  };

  const handlePresetClick = (presetColor: string) => {
    try {
      new AggregationColor(presetColor);
      // setInternalValue(color);
      onChange?.(presetColor);
    } catch {
      // Invalid color, keep the input value but don't update the color
    }

    onChange?.(presetColor);
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
          style={{ backgroundColor: hexValue ?? "#000000" }}
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
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Color Picker Area */}
      <HexAlphaColorPicker
        className="!w-full"
        color={hexValue}
        onChange={handlePickerChange}
      />

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

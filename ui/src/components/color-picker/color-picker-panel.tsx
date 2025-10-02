"use client";

import * as React from "react";
import { HexAlphaColorPicker } from "react-colorful";

import type { ColorPickerPanelProps } from "./types";
import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Input } from "../input";
import { Color } from "./color";

const DEFAULT_HEX_ALPHA = "#000000ff";

const colorToHexAlpha = (color?: Color): string => {
  if (!color) {
    return DEFAULT_HEX_ALPHA;
  }

  const hex = color.toHexString().slice(1);
  const alpha = Math.round(color.toHsl().a * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${hex}${alpha}`;
};

export const ColorPickerPanel: React.FC<ColorPickerPanelProps> = ({
  value,
  onChange,
  onClear,
  format = "hex",
  presets = [],
  className,
  ...props
}) => {
  const [inputValue, setInputValue] = React.useState<string>(
    value ? value.toString(format) : "",
  );

  const pickerColor = React.useMemo(() => colorToHexAlpha(value), [value]);

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value) {
      setInputValue(value.toString(format));
      return;
    }

    setInputValue("");
  }, [value, format]);

  const handlePickerChange = (nextColor: string) => {
    try {
      const color = new Color(nextColor);
      setInputValue(color.toString(format));
      onChange?.(color);
    } catch {
      // Ignore invalid colors emitted by the picker (should not occur)
    }
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    try {
      const color = new Color(newValue);
      onChange?.(color);
    } catch {
      // Invalid color, keep the input value but don't update the color
    }
  };

  const handleInputBlur = () => {
    if (value) {
      setInputValue(value.toString(format));
    }
  };

  const handlePresetClick = (presetColor: string) => {
    const color = new Color(presetColor);
    onChange?.(color);
  };

  const handleClear = () => {
    setInputValue("");
    onClear?.();
  };

  return (
    <div className={cn("space-y-4 p-4", className)} {...props}>
      {/* Color Display */}
      <div className="flex items-center space-x-3">
        <div
          className="border-border h-8 w-8 rounded border"
          style={{ backgroundColor: value?.toHexString() ?? "#000000" }}
        />
        <div className="flex-1">
          <Input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleInputBlur}
            placeholder="Enter color"
            className="text-sm"
          />
        </div>
        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Color Picker Area */}
      <div className="space-y-3">
        <HexAlphaColorPicker
          color={pickerColor}
          onChange={handlePickerChange}
        />
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

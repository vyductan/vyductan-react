"use client";

import React from "react";

import { Color } from "./color";
import { ColorPicker } from "./color-picker";

export const ColorPickerExample: React.FC = () => {
  const [color, setColor] = React.useState<string | undefined>("#ff0000");

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Color Picker Example</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium">Basic Color Picker</label>
        <ColorPicker
          value={color ? new Color(color) : undefined}
          onChange={(newColor) => setColor(newColor?.toHexString())}
          showText
          allowClear
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">With Presets</label>
        <ColorPicker
          presets={[
            "#ff0000",
            "#00ff00",
            "#0000ff",
            "#ffff00",
            "#ff00ff",
            "#00ffff",
            "#000000",
            "#ffffff",
            "#808080",
            "#ffa500",
            "#800080",
            "#008000",
          ]}
          onChange={(newColor) => setColor(newColor?.toHexString())}
        />
      </div>

      <div className="text-muted-foreground text-sm">
        Selected color: {color ?? "None"}
      </div>
    </div>
  );
};

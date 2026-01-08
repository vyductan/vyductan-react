"use client";

import { useState } from "react";

import type { OKLCHColor } from "../color";
import { AggregationColor } from "../color";
import { ColorPickerOKLCHPanel } from "../color-picker-oklch-panel";
import { ColorPickerPanel } from "../color-picker-panel";

export default function ColorPickerOKLCHDemo() {
  const [oklchValue, setOklchValue] = useState<OKLCHColor>({
    l: 0.6,
    c: 0.15,
    h: 180,
    alpha: 1,
  });

  const [hexValue, setHexValue] = useState("#3b82 f6");

  const presetColors = [
    "#FF0000",
    "#FF7F00",
    "#FFFF00",
    "#00FF00",
    "#0000FF",
    "#4B0082",
    "#9400D3",
    "#FF1493",
  ];

  // Convert OKLCH to hex for comparison
  const oklchAsHex = AggregationColor.fromOKLCH(oklchValue).toHexString();

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="mb-4 text-2xl font-bold">OKLCH Color Picker Demo</h2>
        <p className="text-muted-foreground mb-6">
          OKLCH provides perceptually uniform color selection. Moving sliders
          produces visually consistent changes.
        </p>
      </div>

      {/* Basic OKLCH Picker */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Basic OKLCH Picker</h3>
        <div className="border-border rounded-lg border p-4">
          <ColorPickerOKLCHPanel
            oklchValue={oklchValue}
            onChange={setOklchValue}
          />
          <div className="text-muted-foreground mt-4 text-sm">
            <div>
              L:{" "}
              <span className="font-mono">
                {Math.round(oklchValue.l * 100)}%
              </span>
            </div>
            <div>
              C: <span className="font-mono">{oklchValue.c.toFixed(3)}</span>
            </div>
            <div>
              H: <span className="font-mono">{Math.round(oklchValue.h)}°</span>
            </div>
            <div>
              Hex: <span className="font-mono">{oklchAsHex}</span>
            </div>
          </div>
        </div>
      </div>

      {/* OKLCH Picker with Alpha */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">OKLCH Picker with Alpha</h3>
        <div className="border-border rounded-lg border p-4">
          <ColorPickerOKLCHPanel
            oklchValue={oklchValue}
            onChange={setOklchValue}
            showAlpha
          />
        </div>
      </div>

      {/* OKLCH Picker with Presets */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">OKLCH Picker with Presets</h3>
        <div className="border-border rounded-lg border p-4">
          <ColorPickerOKLCHPanel
            oklchValue={oklchValue}
            onChange={setOklchValue}
            presets={presetColors}
          />
        </div>
      </div>

      {/* Side-by-side Comparison */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          Comparison: OKLCH vs Hex Picker
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border-border rounded-lg border p-4">
            <h4 className="mb-2 font-medium">OKLCH (Perceptually Uniform)</h4>
            <ColorPickerOKLCHPanel
              oklchValue={oklchValue}
              onChange={setOklchValue}
            />
          </div>
          <div className="border-border rounded-lg border p-4">
            <h4 className="mb-2 font-medium">Hex/RGB (Traditional)</h4>
            <ColorPickerPanel hexValue={hexValue} onChange={setHexValue} />
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          The OKLCH picker provides more perceptually uniform color selection,
          where equal steps in the sliders result in equal perceived color
          differences.
        </p>
      </div>
    </div>
  );
}

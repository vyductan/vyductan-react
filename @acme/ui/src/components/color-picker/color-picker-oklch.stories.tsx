import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import type { OKLCHColor } from "./color";
import { ColorPickerOKLCHPanel } from "./color-picker-oklch-panel";

const meta = {
  title: "Components/ColorPicker/OKLCH Panel",
  component: ColorPickerOKLCHPanel,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    showAlpha: {
      control: "boolean",
      description: "Show alpha slider",
    },
    presets: {
      control: "object",
      description: "Preset colors",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ColorPickerOKLCHPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with basic OKLCH picker
export const Default: Story = {
  args: {
    oklchValue: {
      l: 0.6,
      c: 0.15,
      h: 180,
      alpha: 1,
    },
    onChange: fn(),
  },
};

// Story with alpha channel
export const WithAlpha: Story = {
  args: {
    oklchValue: {
      l: 0.5,
      c: 0.2,
      h: 270,
      alpha: 0.7,
    },
    showAlpha: true,
    onChange: fn(),
  },
};

// Story with preset colors
export const WithPresets: Story = {
  args: {
    oklchValue: {
      l: 0.6,
      c: 0.15,
      h: 180,
      alpha: 1,
    },
    presets: [
      "#FF0000", // Red
      "#FF7F00", // Orange
      "#FFFF00", // Yellow
      "#00FF00", // Green
      "#0000FF", // Blue
      "#4B0082", // Indigo
      "#9400D3", // Violet
      "#FF1493", // Pink
    ],
    onChange: fn(),
  },
};

// Story with clear button
export const WithClear: Story = {
  args: {
    oklchValue: {
      l: 0.6,
      c: 0.15,
      h: 180,
      alpha: 1,
    },
    onClear: fn(),
    onChange: fn(),
  },
};

// Interactive story demonstrating color updates
export const Interactive: Story = {
  render: (args) => {
    const [color, setColor] = useState<OKLCHColor>({
      l: 0.6,
      c: 0.15,
      h: 180,
      alpha: 1,
    });

    return (
      <div className="space-y-4">
        <div className="text-sm">
          <div className="font-semibold">Current OKLCH Values:</div>
          <div className="text-muted-foreground font-mono">
            L: {Math.round(color.l * 100)}%
          </div>
          <div className="text-muted-foreground font-mono">
            C: {color.c.toFixed(3)}
          </div>
          <div className="text-muted-foreground font-mono">
            H: {Math.round(color.h)}°
          </div>
          {args.showAlpha && (
            <div className="text-muted-foreground font-mono">
              Alpha: {Math.round((color.alpha ?? 1) * 100)}%
            </div>
          )}
        </div>
        <ColorPickerOKLCHPanel
          {...args}
          oklchValue={color}
          onChange={setColor}
        />
      </div>
    );
  },
  args: {
    showAlpha: true,
    presets: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
  },
};

// Different color variations
export const ColorVariations: Story = {
  render: () => {
    const colors: Array<{ name: string; value: OKLCHColor }> = [
      { name: "Bright Red", value: { l: 0.55, c: 0.25, h: 25, alpha: 1 } },
      { name: "Ocean Blue", value: { l: 0.6, c: 0.15, h: 230, alpha: 1 } },
      { name: "Forest Green", value: { l: 0.5, c: 0.13, h: 145, alpha: 1 } },
      { name: "Sunset Orange", value: { l: 0.65, c: 0.18, h: 50, alpha: 1 } },
      { name: "Purple", value: { l: 0.5, c: 0.2, h: 310, alpha: 1 } },
    ];

    return (
      <div className="grid grid-cols-2 gap-4">
        {colors.map(({ name, value }) => (
          <div key={name} className="space-y-2">
            <div className="text-sm font-medium">{name}</div>
            <ColorPickerOKLCHPanel oklchValue={value} onChange={fn()} />
          </div>
        ))}
      </div>
    );
  },
};

// Comparison: Low vs High Chroma
export const ChromaComparison: Story = {
  render: () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Low Chroma (Muted)</div>
          <ColorPickerOKLCHPanel
            oklchValue={{ l: 0.6, c: 0.05, h: 180, alpha: 1 }}
            onChange={fn()}
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">High Chroma (Vibrant)</div>
          <ColorPickerOKLCHPanel
            oklchValue={{ l: 0.6, c: 0.25, h: 180, alpha: 1 }}
            onChange={fn()}
          />
        </div>
      </div>
    );
  },
};

// Comparison: Different Lightness
export const LightnessComparison: Story = {
  render: () => {
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Dark (L: 30%)</div>
          <ColorPickerOKLCHPanel
            oklchValue={{ l: 0.3, c: 0.15, h: 180, alpha: 1 }}
            onChange={fn()}
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Medium (L: 60%)</div>
          <ColorPickerOKLCHPanel
            oklchValue={{ l: 0.6, c: 0.15, h: 180, alpha: 1 }}
            onChange={fn()}
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Light (L: 90%)</div>
          <ColorPickerOKLCHPanel
            oklchValue={{ l: 0.9, c: 0.15, h: 180, alpha: 1 }}
            onChange={fn()}
          />
        </div>
      </div>
    );
  },
};

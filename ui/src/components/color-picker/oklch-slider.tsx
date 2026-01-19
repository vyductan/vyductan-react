"use client";

import type { PlainColorObject } from "colorjs.io";
import type * as React from "react";
import { useMemo } from "react";
import {
  ColorSpace,
  OKLCH,
  serialize,
  sRGB,
  sRGB_Linear,
  to,
} from "colorjs.io/fn";

import { cn } from "../../lib/utils";
import { Slider } from "../slider";

// Explicitly register color spaces for the tree-shakable API
ColorSpace.register(sRGB_Linear);
ColorSpace.register(sRGB);
ColorSpace.register(OKLCH);

interface OKLCHSliderProps {
  /**
   * Current OKLCH values
   */
  l: number;
  c: number;
  h: number;
  alpha?: number;

  /**
   * Which channel to control
   */
  channel: "l" | "c" | "h" | "alpha";

  /**
   * Callback when value changes
   */
  onChange: (value: number) => void;

  /**
   * Additional CSS class
   */
  className?: string;
}

export const OKLCHSlider: React.FC<OKLCHSliderProps> = ({
  l,
  c,
  h,
  alpha = 1,
  channel,
  onChange,
  className,
}) => {
  const config = useMemo(() => {
    switch (channel) {
      case "l": {
        return {
          label: "Lightness",
          min: 0,
          max: 1,
          step: 0.01,
          value: l,
          format: (v: number) => `${Math.round(v * 100)}%`,
        };
      }
      case "c": {
        return {
          label: "Chroma",
          min: 0,
          max: 0.4,
          step: 0.001,
          value: c,
          format: (v: number) => v.toFixed(3),
        };
      }
      case "h": {
        return {
          label: "Hue",
          min: 0,
          max: 360,
          step: 1,
          value: h,
          format: (v: number) => `${Math.round(v)}°`,
        };
      }
      case "alpha": {
        return {
          label: "Alpha",
          min: 0,
          max: 1,
          step: 0.01,
          value: alpha,
          format: (v: number) => `${Math.round(v * 100)}%`,
        };
      }
      default: {
        return {
          label: "",
          min: 0,
          max: 1,
          step: 0.01,
          value: 0,
          format: String,
        };
      }
    }
  }, [channel, l, c, h, alpha]);

  // Generate gradient background for the slider
  const gradientBackground = useMemo(() => {
    const steps = 10;
    const colors: string[] = [];

    for (let i = 0; i <= steps; i++) {
      let stepValue: number;
      let oklchColor: PlainColorObject;

      switch (channel) {
        case "l": {
          stepValue = (i / steps) * config.max;
          oklchColor = {
            space: "oklch",
            coords: [stepValue, c, h],
            alpha,
          } as unknown as PlainColorObject;
          break;
        }
        case "c": {
          stepValue = (i / steps) * config.max;
          oklchColor = {
            space: "oklch",
            coords: [l, stepValue, h],
            alpha,
          } as unknown as PlainColorObject;
          break;
        }
        case "h": {
          stepValue = (i / steps) * config.max;
          oklchColor = {
            space: "oklch",
            coords: [l, c, stepValue],
            alpha,
          } as unknown as PlainColorObject;
          break;
        }
        case "alpha": {
          stepValue = i / steps;
          oklchColor = {
            space: "oklch",
            coords: [l, c, h],
            alpha: stepValue,
          } as unknown as PlainColorObject;
          break;
        }
        default: {
          oklchColor = {
            space: "oklch",
            coords: [l, c, h],
            alpha,
          } as unknown as PlainColorObject;
        }
      }

      // Convert to sRGB for display
      const rgbColor = to(oklchColor, "srgb");
      const hexColor = serialize(rgbColor, { format: "hex" });
      colors.push(hexColor);
    }

    return `linear-gradient(to right, ${colors.join(", ")})`;
  }, [channel, l, c, h, alpha, config.max]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{config.label}</label>
        <span className="text-muted-foreground text-xs">
          {config.format(config.value)}
        </span>
      </div>
      <div
        className="relative rounded-md p-1"
        style={{
          background: gradientBackground,
        }}
      >
        <Slider
          value={[config.value]}
          onValueChange={(values) => onChange(values[0] ?? config.value)}
          min={config.min}
          max={config.max}
          step={config.step}
          ariaLabel={config.label}
          className="**:[[role=slider]]:border-white **:[[role=slider]]:shadow-lg"
        />
      </div>
    </div>
  );
};

import type { ColorTypes } from "colorjs.io";
import ColorjsColor from "colorjs.io";

import type { ColorGenInput, Colors } from "./types";

export const toHexFormat = (value?: string, alpha?: boolean) =>
  value?.replaceAll(/[^\w/]/g, "").slice(0, alpha ? 8 : 6) ?? "";

export const getHex = (value?: string, alpha?: boolean) =>
  value ? toHexFormat(value, alpha) : "";

export type GradientColor = {
  color: AggregationColor;
  percent: number;
}[];

class ExtendedColor extends ColorjsColor {
  constructor(color: ColorTypes) {
    super(color);
  }

  setA(a: number): ExtendedColor {
    return new ExtendedColor(this.set("a", a));
  }
  setH(h: number): ExtendedColor {
    return new ExtendedColor(this.set("h", h));
  }
  setS(s: number): ExtendedColor {
    return new ExtendedColor(this.set("s", s));
  }
  setB(b: number): ExtendedColor {
    return new ExtendedColor(this.set("b", b));
  }

  toHexString(): string {
    return this.toString({ format: "hex" });
  }
  toRgb(): {
    r: number;
    g: number;
    b: number;
    a: number;
  } {
    return this.to("rgb");
  }
  toRgbString(): string {
    return this.to("rgb").toString();
  }
  toHsl(): {
    l: number;
    a: number;
    h: number;
    s: number;
  } {
    return this.to("hsl");
  }

  toHsb(): {
    b: number;
    a: number;
    h: number;
    s: number;
  } {
    const hsl = this.to("hsl");
    // Convert HSL to HSB (HSV)
    const h = hsl.h;
    const s = hsl.s;
    const l = hsl.l;
    const a = hsl.a;

    const v = l + s * Math.min(l, 1 - l);
    const b = v === 0 ? 0 : 2 * (1 - l / v);

    return { h, s: b, b: v, a };
  }
  toHsbString(): string {
    return this.toString({ format: "hsb" });
  }
}

export declare class Color extends ExtendedColor {
  constructor(color: ColorGenInput);
  toHsbString(): string;
  toHsb(): {
    b: number;
    a: number;
    h: number;
    s: number;
  };
}

export class AggregationColor {
  private metaColor: Color;

  private colors: GradientColor | undefined;

  public cleared = false;

  constructor(
    color: ColorGenInput<AggregationColor> | Colors<AggregationColor>,
  ) {
    // Clone from another AggregationColor
    if (color instanceof AggregationColor) {
      this.metaColor = color.metaColor.clone();
      this.colors = color.colors?.map((info) => ({
        color: new AggregationColor(info.color),
        percent: info.percent,
      }));
      this.cleared = color.cleared;
      return;
    }

    const isArray = Array.isArray(color);

    const firstColor = this.colors?.[0];
    if (isArray && color.length > 0 && firstColor) {
      this.colors = color.map(({ color: c, percent }) => ({
        color: new AggregationColor(c),
        percent,
      }));
      this.metaColor = new ExtendedColor(firstColor.color.metaColor);
    } else {
      this.metaColor = new ExtendedColor(
        isArray
          ? ""
          : typeof color === "number"
            ? color.toString()
            : typeof color === "object" && "r" in color
              ? `rgb(${color.r}, ${color.g}, ${color.b})`
              : typeof color === "object" && "h" in color
                ? `hsl(${color.h}, ${color.s}%, ${color.b}%)`
                : color,
      );
    }

    if (!color || (isArray && !this.colors)) {
      this.metaColor = this.metaColor.setA(0);
      this.cleared = true;
    }
  }

  toHsb() {
    return this.metaColor.toHsb();
  }

  toHsbString() {
    return this.metaColor.toHsbString();
  }

  toHex() {
    return getHex(this.toHexString(), this.metaColor.a < 1);
  }

  toHexString() {
    return this.metaColor.toHexString();
  }

  toRgb() {
    return this.metaColor.toRgb();
  }

  toRgbString() {
    return this.metaColor.toRgbString();
  }

  isGradient(): boolean {
    return !!this.colors && !this.cleared;
  }

  getColors(): GradientColor {
    return this.colors ?? [{ color: this, percent: 0 }];
  }

  toCssString(): string {
    const { colors } = this;

    // CSS line-gradient
    if (colors) {
      const colorsStr = colors
        .map((c) => `${c.color.toRgbString()} ${c.percent}%`)
        .join(", ");
      return `linear-gradient(90deg, ${colorsStr})`;
    }

    return this.metaColor.toRgbString();
  }

  equals(color: AggregationColor | null): boolean {
    if (!color || this.isGradient() !== color.isGradient()) {
      return false;
    }

    if (!this.isGradient()) {
      return this.toHexString() === color.toHexString();
    }

    return (
      !!this.colors &&
      !!color.colors &&
      this.colors.length === color.colors.length &&
      this.colors.every((c, i) => {
        const target = color.colors?.[i];
        return c.percent === target?.percent && c.color.equals(target.color);
      })
    );
  }
}

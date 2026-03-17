// Tree-shakable imports from colorjs.io/fn
import type { PlainColorObject } from "colorjs.io";
import {
  ColorSpace,
  HSL,
  OKLab,
  OKLCH,
  parse,
  serialize,
  sRGB,
  sRGB_Linear,
  to,
} from "colorjs.io/fn";

import type { ColorGenInput, Colors } from "./types";

// Explicitly register color spaces for the tree-shakable API
// This is required for parse() to recognize color formats
ColorSpace.register(sRGB_Linear);
ColorSpace.register(sRGB);
ColorSpace.register(HSL);
ColorSpace.register(OKLab);
ColorSpace.register(OKLCH);

export const toHexFormat = (value?: string, alpha?: boolean) =>
  value?.replaceAll(/[^\w/]/g, "").slice(0, alpha ? 8 : 6) ?? "";

export const getHex = (value?: string, alpha?: boolean) =>
  value ? toHexFormat(value, alpha) : "";

export type GradientColor = {
  color: AggregationColor;
  percent: number;
}[];

// OKLCH color type
export interface OKLCHColor {
  l: number;
  c: number;
  h: number;
  alpha?: number;
}

export class Color {
  private colorObject: PlainColorObject;
  public a: number;
  public r: number;
  public g: number;
  public b: number;
  public h: number;
  public s: number;
  public l: number;

  constructor(color: ColorGenInput) {
    // Parse color input
    let colorObj: PlainColorObject;

    if (Array.isArray(color)) {
      // Handle array input - create a default black color
      colorObj = {
        space: "srgb",
        coords: [0, 0, 0],
        alpha: 1,
      } as unknown as PlainColorObject;
    } else if (typeof color === "number") {
      colorObj = parse(color.toString()) as unknown as PlainColorObject;
    } else if (typeof color === "object") {
      // Handle RGB/RGBA objects
      if ("r" in color && "g" in color && "b" in color) {
        const r: number =
          typeof color.r === "string" ? Number.parseFloat(color.r) : color.r;
        const g: number =
          typeof color.g === "string" ? Number.parseFloat(color.g) : color.g;
        const b: number =
          typeof color.b === "string" ? Number.parseFloat(color.b) : color.b;
        const a: number | undefined =
          "a" in color
            ? typeof color.a === "string"
              ? Number.parseFloat(color.a)
              : color.a
            : undefined;
        colorObj = {
          space: "srgb",
          coords: [r, g, b],
          alpha: a,
        } as unknown as PlainColorObject;
      }
      // Handle HSL/HSLA objects
      else {
        const h: number =
          typeof color.h === "string" ? Number.parseFloat(color.h) : color.h;
        const s: number =
          typeof color.s === "string" ? Number.parseFloat(color.s) : color.s;
        const b: number =
          typeof color.b === "string" ? Number.parseFloat(color.b) : color.b;
        const a: number | undefined =
          "a" in color
            ? typeof color.a === "string"
              ? Number.parseFloat(color.a)
              : color.a
            : undefined;
        colorObj = {
          space: "hsl",
          coords: [h, s, b],
          alpha: a,
        } as unknown as PlainColorObject;
      }
    } else {
      colorObj = parse(color) as unknown as PlainColorObject;
    }

    this.colorObject = colorObj;

    // Convert to sRGB to get RGB values
    const rgb = to(colorObj, "srgb");
    this.r = rgb.coords[0] ?? 0;
    this.g = rgb.coords[1] ?? 0;
    this.b = rgb.coords[2] ?? 0;

    // Convert to HSL to get HSL values
    const hsl = to(colorObj, "hsl");
    this.h = hsl.coords[0] ?? 0;
    this.s = hsl.coords[1] ?? 0;
    this.l = hsl.coords[2] ?? 0;

    this.a = colorObj.alpha ?? 1;
    this.a = colorObj.alpha ?? 1;
  }

  clone(): Color {
    return new Color(serialize(this.colorObject));
  }

  setA(a: number) {
    this.a = a;
    this.colorObject = { ...this.colorObject, alpha: a };
    return this;
  }

  toHexString(): string {
    const hex = serialize(this.colorObject, { format: "hex" });
    return hex.length === 4
      ? "#" +
          (hex[1] ?? "").repeat(2) +
          (hex[2] ?? "").repeat(2) +
          (hex[3] ?? "").repeat(2)
      : hex;
  }

  toRgb(): {
    r: number;
    g: number;
    b: number;
    a: number | undefined;
  } {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a,
    };
  }

  toRgbString(): string {
    return serialize(this.colorObject, { format: "rgb" });
  }

  toHsb(): {
    b: number;
    a: number;
    h: number;
    s: number;
  } {
    return {
      h: this.h,
      s: this.s,
      b: this.b,
      a: this.a,
    };
  }

  toHsbString(): string {
    return serialize(to(this.colorObject, "hsl"), { format: "hsl" });
  }

  toOKLCH(): OKLCHColor {
    const oklch = to(this.colorObject, "oklch");
    return {
      l: oklch.coords[0] ?? 0,
      c: oklch.coords[1] ?? 0,
      h: oklch.coords[2] ?? 0,
      alpha: oklch.alpha ?? undefined,
    };
  }

  toOKLCHString(): string {
    return serialize(to(this.colorObject, "oklch"));
  }

  static fromOKLCH(oklch: OKLCHColor): Color {
    const colorObj: PlainColorObject = {
      space: "oklch",
      coords: [oklch.l, oklch.c, oklch.h],
      alpha: oklch.alpha,
    } as unknown as PlainColorObject;
    return new Color(serialize(colorObj));
  }
}

export class AggregationColor {
  private metaColor: Color = new Color("#000000");

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

    if (isArray && color.length > 0) {
      this.colors = color.map(({ color: c, percent }) => ({
        color: new AggregationColor(c),
        percent,
      }));
      if (this.colors[0]) {
        this.metaColor = new Color(this.colors[0].color.toHexString());
      }
    } else {
      this.metaColor = new Color(isArray ? "" : color);
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

  toOKLCH() {
    return this.metaColor.toOKLCH();
  }

  toOKLCHString() {
    return this.metaColor.toOKLCHString();
  }

  static fromOKLCH(oklch: OKLCHColor): AggregationColor {
    return new AggregationColor(Color.fromOKLCH(oklch).toHexString());
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
    if (this.isGradient() !== color?.isGradient()) {
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

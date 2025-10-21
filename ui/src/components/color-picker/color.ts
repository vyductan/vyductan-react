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

export class Color {
  private colorTypes: ColorTypes;
  public a: number;
  public r: number;
  public g: number;
  public b: number;
  public h: number;
  public s: number;
  public l: number;

  constructor(color: ColorGenInput) {
    // console.log("color", color);

    // Convert color input to a format that colorjs.io can understand
    let colorTypes: ColorTypes;

    if (Array.isArray(color)) {
      colorTypes = "";
    } else if (typeof color === "number") {
      colorTypes = color.toString();
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
        colorTypes = { space: "srgb", coords: [r, g, b], alpha: a };
      }
      // Handle HSB/HSBA objects
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
        colorTypes = { space: "hsl", coords: [h, s, b], alpha: a };
      }
    } else {
      colorTypes = color;
    }
    const _color = new ColorjsColor(colorTypes);
    this.colorTypes = colorTypes;
    this.a = _color.a;
    this.r = _color.r;
    this.g = _color.g;
    this.b = _color.b;
    this.h = _color.h;
    this.s = _color.s;
    this.l = _color.l;
  }

  clone(): Color {
    return this;
  }

  setA(a: number) {
    this.a = a;
    return this;
  }

  toHexString(): string {
    const hex = new ColorjsColor(this.colorTypes).toString({
      format: "hex",
    });
    return hex.length === 4
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        "#" + hex[1]!.repeat(2) + hex[2]!.repeat(2) + hex[3]!.repeat(2)
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
    return new ColorjsColor(this.colorTypes).toString({ format: "rgb" });
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
    return new ColorjsColor(this.colorTypes).toString({ format: "hsb" });
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
        this.metaColor = new Color(this.colors[0].color.metaColor);
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

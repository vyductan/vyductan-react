export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

export interface HslaColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

export type ColorValue = string | RgbaColor | HslColor | HslaColor;

export class Color {
  private _r: number;
  private _g: number;
  private _b: number;
  private _a: number;

  constructor(value: ColorValue) {
    if (typeof value === "string") {
      const parsed = this.parseString(value);
      this._r = parsed.r;
      this._g = parsed.g;
      this._b = parsed.b;
      this._a = parsed.a;
    } else if ("r" in value && "g" in value && "b" in value) {
      this._r = Math.max(0, Math.min(255, value.r));
      this._g = Math.max(0, Math.min(255, value.g));
      this._b = Math.max(0, Math.min(255, value.b));
      this._a = Math.max(0, Math.min(1, value.a));
    } else if ("h" in value && "s" in value && "l" in value) {
      const rgb = this.hslToRgb(value.h, value.s, value.l);
      this._r = rgb.r;
      this._g = rgb.g;
      this._b = rgb.b;
      this._a = Math.max(0, Math.min(1, value.a));
    } else {
      throw new Error("Invalid color value");
    }
  }

  private parseString(value: string): RgbaColor {
    const trimmed = value.trim();

    // Hex format (#rgb, #rrggbb, #rrggbbaa)
    if (trimmed.startsWith("#")) {
      return this.parseHex(trimmed);
    }

    // RGB/RGBA format
    if (trimmed.startsWith("rgb")) {
      return this.parseRgb(trimmed);
    }

    // HSL/HSLA format
    if (trimmed.startsWith("hsl")) {
      return this.parseHsl(trimmed);
    }

    throw new Error(`Unsupported color format: ${value}`);
  }

  private parseHex(hex: string): RgbaColor {
    const clean = hex.slice(1);

    if (clean.length === 3) {
      return {
        r: Number.parseInt((clean[0] ?? "0") + (clean[0] ?? "0"), 16),
        g: Number.parseInt((clean[1] ?? "0") + (clean[1] ?? "0"), 16),
        b: Number.parseInt((clean[2] ?? "0") + (clean[2] ?? "0"), 16),
        a: 1,
      };
    }

    if (clean.length === 6) {
      return {
        r: Number.parseInt(clean.slice(0, 2), 16),
        g: Number.parseInt(clean.slice(2, 4), 16),
        b: Number.parseInt(clean.slice(4, 6), 16),
        a: 1,
      };
    }

    if (clean.length === 8) {
      return {
        r: Number.parseInt(clean.slice(0, 2), 16),
        g: Number.parseInt(clean.slice(2, 4), 16),
        b: Number.parseInt(clean.slice(4, 6), 16),
        a: Number.parseInt(clean.slice(6, 8), 16) / 255,
      };
    }

    throw new Error(`Invalid hex color: ${hex}`);
  }

  private parseRgb(rgb: string): RgbaColor {
    const match = /rgba?\(([^)]+)\)/.exec(rgb);
    if (!match?.[1]) throw new Error(`Invalid RGB color: ${rgb}`);

    const values = match[1].split(",").map((v) => Number.parseFloat(v.trim()));

    if (values.length === 3) {
      return {
        r: Math.max(0, Math.min(255, values[0] ?? 0)),
        g: Math.max(0, Math.min(255, values[1] ?? 0)),
        b: Math.max(0, Math.min(255, values[2] ?? 0)),
        a: 1,
      };
    }

    if (values.length === 4) {
      return {
        r: Math.max(0, Math.min(255, values[0] ?? 0)),
        g: Math.max(0, Math.min(255, values[1] ?? 0)),
        b: Math.max(0, Math.min(255, values[2] ?? 0)),
        a: Math.max(0, Math.min(1, values[3] ?? 0)),
      };
    }

    throw new Error(`Invalid RGB color: ${rgb}`);
  }

  private parseHsl(hsl: string): RgbaColor {
    const match = /hsla?\(([^)]+)\)/.exec(hsl);
    if (!match?.[1]) throw new Error(`Invalid HSL color: ${hsl}`);

    const values = match[1].split(",").map((v) => Number.parseFloat(v.trim()));

    if (values.length === 3) {
      const [h, s, l] = values;
      if (h === undefined || s === undefined || l === undefined) {
        throw new Error(`Invalid HSL color: ${hsl}`);
      }

      const rgb = this.hslToRgb(h, s / 100, l / 100);
      return { ...rgb, a: 1 };
    }

    if (values.length === 4) {
      const [h, s, l, a] = values;
      if (
        h === undefined ||
        s === undefined ||
        l === undefined ||
        a === undefined
      ) {
        throw new Error(`Invalid HSL color: ${hsl}`);
      }

      const rgb = this.hslToRgb(h, s / 100, l / 100);
      return { ...rgb, a: Math.max(0, Math.min(1, a)) };
    }

    throw new Error(`Invalid HSL color: ${hsl}`);
  }

  private hslToRgb(
    h: number,
    s: number,
    l: number,
  ): { r: number; g: number; b: number } {
    h = h / 360;
    const a = s * Math.min(l, 1 - l);

    const f = (n: number) => {
      const k = (n + h * 12) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };

    return {
      r: Math.round(f(0) * 255),
      g: Math.round(f(8) * 255),
      b: Math.round(f(4) * 255),
    };
  }

  private rgbToHsl(
    r: number,
    g: number,
    b: number,
  ): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

      switch (max) {
        case r: {
          h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
          break;
        }
        case g: {
          h = ((b - r) / diff + 2) / 6;
          break;
        }
        case b: {
          h = ((r - g) / diff + 4) / 6;
          break;
        }
      }
    }

    return {
      h: h * 360,
      s: s,
      l: l,
    };
  }

  toRgb(): RgbaColor {
    return {
      r: Math.round(this._r),
      g: Math.round(this._g),
      b: Math.round(this._b),
      a: this._a,
    };
  }

  toHsl(): HslColor {
    const hsl = this.rgbToHsl(this._r, this._g, this._b);
    return {
      h: hsl.h,
      s: hsl.s,
      l: hsl.l,
      a: this._a,
    };
  }

  toHexString(): string {
    const r = Math.round(this._r).toString(16).padStart(2, "0");
    const g = Math.round(this._g).toString(16).padStart(2, "0");
    const b = Math.round(this._b).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  toRgbString(): string {
    const rgb = this.toRgb();
    if (rgb.a === 1) {
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
  }

  toHslString(): string {
    const hsl = this.toHsl();
    if (hsl.a === 1) {
      return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;
    }
    return `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%, ${hsl.a})`;
  }

  toString(format: "hex" | "rgb" | "hsl" = "hex"): string {
    switch (format) {
      case "hex": {
        return this.toHexString();
      }
      case "rgb": {
        return this.toRgbString();
      }
      case "hsl": {
        return this.toHslString();
      }
      default: {
        return this.toHexString();
      }
    }
  }

  get alpha(): number {
    return this._a;
  }

  set alpha(value: number) {
    this._a = Math.max(0, Math.min(1, value));
  }

  clone(): Color {
    return new Color(this.toRgb());
  }

  equals(other: Color): boolean {
    return (
      Math.round(this._r) === Math.round(other._r) &&
      Math.round(this._g) === Math.round(other._g) &&
      Math.round(this._b) === Math.round(other._b) &&
      Math.abs(this._a - other._a) < 0.001
    );
  }
}

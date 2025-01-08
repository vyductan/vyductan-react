export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!match) {
    throw new Error("Invalid HEX color.");
  }
  return {
    r: Number.parseInt(match[1]!, 16),
    g: Number.parseInt(match[2]!, 16),
    b: Number.parseInt(match[3]!, 16),
  };
}

// Hàm chuyển đổi mã màu hex sang HSL
export const hexToHsl = (hex: string) => {
  // Loại bỏ dấu "#" từ chuỗi hex
  hex = hex.replace(/^#/, "");

  // Chuyển đổi hex sang RGB
  const { r, g, b } = hexToRgb(hex);

  // Chia các giá trị RGB cho 255 để có giá trị từ 0 đến 1
  const rNormalized = r / 255;
  const gNormalized = g / 255;
  const bNormalized = b / 255;

  // Tìm giá trị tối đa và tối thiểu trong RGB
  const cMax = Math.max(rNormalized, gNormalized, bNormalized);
  const cMin = Math.min(rNormalized, gNormalized, bNormalized);
  const delta = cMax - cMin;

  // Tính giá trị Hue (màu sắc)
  let h = 0;
  if (delta === 0) {
    h = 0;
  } else if (cMax === rNormalized) {
    h = ((gNormalized - bNormalized) / delta) % 6;
  } else if (cMax === gNormalized) {
    h = (bNormalized - rNormalized) / delta + 2;
  } else {
    h = (rNormalized - gNormalized) / delta + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  // Tính giá trị Lightness (độ sáng)
  const l = (cMax + cMin) / 2;

  // Tính giá trị Saturation (độ bão hòa)
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // to %
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
};

function rgbToOklch({ r, g, b }: { r: number; g: number; b: number }): {
  l: number;
  c: number;
  h: number;
} {
  // Normalize RGB to [0, 1]
  r /= 255;
  g /= 255;
  b /= 255;

  // Convert RGB to linear light
  const linearize = (c: number) =>
    c <= 0.040_45 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);

  // Convert linear RGB to XYZ
  const x = lr * 0.412_456_4 + lg * 0.357_576_1 + lb * 0.180_437_5;
  const y = lr * 0.212_672_9 + lg * 0.715_152_2 + lb * 0.072_175;
  const z = lr * 0.019_333_9 + lg * 0.119_192 + lb * 0.950_304_1;

  // Convert XYZ to LAB
  const refX = 0.950_47;
  const refY = 1;
  const refZ = 1.088_83;

  const fx =
    x / refX > 0.008_856 ? Math.cbrt(x / refX) : (7.787 * x) / refX + 16 / 116;
  const fy =
    y / refY > 0.008_856 ? Math.cbrt(y / refY) : (7.787 * y) / refY + 16 / 116;
  const fz =
    z / refZ > 0.008_856 ? Math.cbrt(z / refZ) : (7.787 * z) / refZ + 16 / 116;

  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b_ = 200 * (fy - fz);

  // Convert LAB to OKLCH
  const c = Math.hypot(a, b_);
  const h = Math.atan2(b_, a) * (180 / Math.PI);

  return {
    l: l / 100, // Lightness (normalized to [0, 1])
    c, // Chroma
    h: h >= 0 ? h : h + 360, // Hue (adjusted to [0, 360])
  };
}

export function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const rgb = hexToRgb(hex);
  return rgbToOklch(rgb);
}

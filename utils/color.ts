export const hexToRgb = (hex: string) => {
  // Loại bỏ dấu "#" từ chuỗi hex
  hex = hex.replace(/^#/, "");

  // Chia chuỗi thành các thành phần màu RGB
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
};

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

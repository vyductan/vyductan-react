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
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // Chia các giá trị RGB cho 255 để có giá trị từ 0 đến 1
  const rNormalized = r / 255;
  const gNormalized = g / 255;
  const bNormalized = b / 255;

  // Tìm giá trị tối đa và tối thiểu trong RGB
  const max = Math.max(rNormalized, gNormalized, bNormalized);
  const min = Math.min(rNormalized, gNormalized, bNormalized);

  let h: number, s: number, l: number;

  // Tính giá trị Hue (màu sắc)
  if (max === min) {
    h = 0; // Màu xám
  } else if (max === rNormalized) {
    h = (60 * ((gNormalized - bNormalized) / (max - min)) + 360) % 360;
  } else if (max === gNormalized) {
    h = 60 * ((bNormalized - rNormalized) / (max - min)) + 120;
  } else {
    h = 60 * ((rNormalized - gNormalized) / (max - min)) + 240;
  }

  // Tính giá trị Lightness (độ sáng)
  l = ((max + min) / 2) * 100;

  // Tính giá trị Saturation (độ bão hòa)
  if (max === 0 || max === min) {
    s = 0;
  } else if (max === rNormalized) {
    s = ((max - min) / max) * 100;
  } else {
    s = ((max - min) / (1 - Math.abs(2 * l - 1))) * 100;
  }

  h = Math.round(h);
  s = Math.round(s);
  l = Math.round(l);

  return { h, s, l };
};

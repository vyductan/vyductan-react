/**
 * The editor's closed color palette.
 *
 * Values are Tailwind v4's 500 step, converted from the `oklch()` in
 * `tailwindcss/theme.css` to sRGB hex. Two reasons for the concrete notation
 * rather than `var(--color-red-500)` or the oklch source:
 *
 * - The string is persisted into the document and rendered by consumers that
 *   share none of our CSS — WordPress, email. A missing custom property makes
 *   `color` invalid at computed-value time, which silently falls back to the
 *   inherited color, so a `var()` reference would simply lose the color there.
 * - `oklch()` needs a 2023-era browser. Where it is unsupported the declaration
 *   is dropped the same way, so hex reaches strictly more readers. The cost is a
 *   clamp into sRGB, which shifts the most saturated hues slightly.
 *
 * A closed set rather than a free-form picker is the other half: it keeps
 * `#000000` out of stored content, the one value that turns invisible when the
 * page is read in dark mode.
 */

type ColorHue = {
  name: string;
  hex: string;
};

const COLOR_HUES: ColorHue[] = [
  { name: "Gray", hex: "#6a7282" },
  { name: "Red", hex: "#fb2c36" },
  { name: "Orange", hex: "#ff6900" },
  { name: "Amber", hex: "#fe9a00" },
  { name: "Yellow", hex: "#f0b100" },
  { name: "Green", hex: "#00c950" },
  { name: "Teal", hex: "#00bba7" },
  { name: "Blue", hex: "#2b7fff" },
  { name: "Indigo", hex: "#615fff" },
  { name: "Violet", hex: "#8e51ff" },
  { name: "Pink", hex: "#f6339a" },
];

/**
 * Highlights are the same hue at 25% alpha instead of an opaque light tint. An
 * overlay darkens a dark page and lightens a light one, so the text keeps
 * whatever contrast the page already had — the only way a single stored literal
 * stays readable in both themes.
 */
const HIGHLIGHT_ALPHA = 0.25;

function toRgbaChannels(hex: string): string {
  const value = Number.parseInt(hex.slice(1), 16);

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].join(", ");
}

export type EditorColorSwatch = {
  name: string;
  value: string;
};

export const EDITOR_TEXT_COLORS: EditorColorSwatch[] = COLOR_HUES.map(
  ({ name, hex }) => ({ name, value: hex }),
);

export const EDITOR_HIGHLIGHT_COLORS: EditorColorSwatch[] = COLOR_HUES.map(
  ({ name, hex }) => ({
    name,
    // `rgba()` rather than 8-digit hex: the oldest renderers in this content's
    // path understand the function form.
    value: `rgba(${toRgbaChannels(hex)}, ${HIGHLIGHT_ALPHA})`,
  }),
);

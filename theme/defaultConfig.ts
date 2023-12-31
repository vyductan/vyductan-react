import { theme } from "tailwindcss/defaultConfig";

export type Screens = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const defaultTailwindScreensConfig = theme?.screens as Record<string, string>;

export const defaultScreensConfig = (() => {
  const c: Record<string, number> = {};
  Object.keys(defaultTailwindScreensConfig).map((x) => {
    c[x] = Number(defaultTailwindScreensConfig[x]!.replace("px", ""));
  });
  return {
    xs: 0,
    ...c,
  };
})() as Record<Screens, number>;

export type ResponsiveConfig = typeof defaultScreensConfig;

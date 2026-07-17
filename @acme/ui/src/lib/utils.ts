import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register the custom spacing tokens from styles/token.css (@theme --spacing-*)
// so tailwind-merge recognizes h-control / min-h-control / size-control / etc.
// as spacing utilities and can dedupe them against overrides (e.g. a consumer
// passing min-h-[52px]). Without this, twMerge keeps both and CSS source order
// wins — usually the built-in *-control class, silently ignoring the override.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ["control", "control-sm", "control-lg", "line-height"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isBrowser = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ["xs", "sm", "md", "lg", "xl"],
    },
  },
});

export const clsm = (...inputs: ClassValue[]) => {
  return customTwMerge(clsx(inputs));
};

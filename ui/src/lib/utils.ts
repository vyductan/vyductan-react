/* eslint-disable unicorn/prefer-global-this */
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isBrowser = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

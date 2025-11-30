import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isBrowser = !!(
  // eslint-disable-next-line unicorn/prefer-global-this
  typeof window !== "undefined" &&
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/prefer-optional-chain, unicorn/prefer-global-this
  window.document &&
  // eslint-disable-next-line unicorn/prefer-global-this
  window.document.createElement
);


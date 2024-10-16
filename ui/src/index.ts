import { cx } from "class-variance-authority";
import { extendTailwindMerge } from "tailwind-merge";

export * from "./types";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      w: ["w-screen-sm", "w-screen-md", "w-screen-xl"],
    },
  },
});
const clsm = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs));

export { clsm };

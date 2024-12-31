import { cx } from "class-variance-authority";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      w: ["w-screen-sm", "w-screen-md", "w-screen-xl"],
    },
  },
});
const cn = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs));

export { cn };

export { UiProvider } from "./store";

// import type { CnOptions } from "tailwind-variants";
// import { cnBase, defaultConfig } from "tailwind-variants";
//
// defaultConfig.twMergeConfig = {
//   extend: {
//     classGroups: {
//       w: ["w-screen-sm", "w-screen-md", "w-screen-xl"],
//     },
//   },
// };

// export * from "./types";
//
// export const cn = cnBase as <T extends CnOptions>(...classes: T) => string;

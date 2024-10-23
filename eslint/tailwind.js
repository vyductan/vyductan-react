import * as path from "node:path";
// import { fileURLToPath } from "url";
// @ts-expect-error
import tailwindPlugin from "eslint-plugin-tailwindcss";

// const __filename = fileURLToPath(import.meta.url);

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
  ...tailwindPlugin.configs["flat/recommended"],
  {
    // plugins: {
    //   tailwindcss: tailwindPlugin,
    // },
    // rules: {
    //   ...tailwindPlugin.rules,
    // },
    settings: {
      tailwindcss: {
        callees: ["cn", "cva", "cx"],
        config: path.join(import.meta.dirname, "../tailwind/web.ts"),
        // config: "../tailwind/web.ts",
        // config: fileURLToPath(
        //   new URL("../tailwind/web.ts", "file://" + __filename),
        // ),
        cssFiles: [
          "**/*.{css,scss}",
          "!**/node_modules",
          "!**/.*",
          "!**/dist",
          "!**/build",
        ],
        whitelist: ["_.+"],
      },
    },
  },
];

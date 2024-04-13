import { fileURLToPath } from "url";
import tailwindPlugin from "eslint-plugin-tailwindcss";
import tailwind from "tailwindcss";

const __filename = fileURLToPath(import.meta.url);

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
  {
    plugins: {
      tailwindcss: tailwindPlugin,
    },
    // rules: {
    //   ...tailwindPlugin.rules,
    // },
    settings: {
      tailwindcss: {
        callees: ["clsm", "cva", "cx"],
        config: fileURLToPath(
          new URL("../tailwind/web.ts", "file://" + __filename),
        ),
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

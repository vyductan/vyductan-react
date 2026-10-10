/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

import { fileURLToPath } from "node:url";

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
  plugins: [
    import.meta.resolve("@ianvs/prettier-plugin-sort-imports"),
    import.meta.resolve("prettier-plugin-packagejson"),
    import.meta.resolve("prettier-plugin-tailwindcss"),
  ],
  // Tailwind v4 has no JS config: without the entry stylesheet the plugin
  // can't see theme tokens (bg-background, text-muted-foreground…) and sorts
  // them as unknown classes to the front. apps/web adds no theme of its own.
  tailwindStylesheet: fileURLToPath(
    new URL("../ui/src/styles/globals.css", import.meta.url),
  ),
  tailwindFunctions: ["tv"],
  importOrder: [
    "<TYPES>",
    "^(react/(.*)$)|^(react$)|^(react-native(.*)$)",
    "^(next/(.*)$)|^(next$)",
    "^(expo(.*)$)|^(expo$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "<TYPES>^@acme",
    "^@acme/(.*)$",
    "",
    "<TYPES>^[.|..|~]",
    "^~/",
    "^[../]",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "4.4.0",
  overrides: [
    {
      files: "*.json.hbs",
      options: {
        parser: "json",
      },
    },
    {
      files: "*.ts.hbs",
      options: {
        parser: "babel",
      },
    },
  ],
};

export default config;

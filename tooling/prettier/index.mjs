// const { fileURLToPath } = require("url");
import { fileURLToPath } from "url";

/** @typedef  {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef  {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
  // plugins: [
  //   require.resolve("@ianvs/prettier-plugin-sort-imports"),
  //   require.resolve("prettier-plugin-tailwindcss"),
  // ],
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-packagejson",
    "prettier-plugin-tailwindcss",
  ],
  tailwindConfig: fileURLToPath(
    // new URL("../tailwind/index.ts", require('url').pathToFileURL(__filename).toString()),
    new URL("../tailwind/index.ts", import.meta.url),
  ),
  importOrder: [
    "^(react/(.*)$)|^(react$)|^(react-native(.*)$)",
    "^(next/(.*)$)|^(next$)",
    "^(expo(.*)$)|^(expo$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@vyductan/(.*)$",
    "^@acme/(.*)$",
    "",
    "^~/",
    "^[../]",
    "^[./]",
  ],
};

export default config;

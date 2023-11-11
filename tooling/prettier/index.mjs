import { fileURLToPath } from "url";

const config = {
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-packagejson",
    "prettier-plugin-tailwindcss",
  ],
  tailwindConfig: fileURLToPath(
    new URL("../tailwind/index.ts", import.meta.url),
  ),
  importOrder: [
    "^(react/(.*)$)|^(react$)|^(react-native(.*)$)",
    "^(next/(.*)$)|^(next$)",
    "^(expo(.*)$)|^(expo$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@vyductan/(.*)$",
    "",
    "^~/",
    "^[../]",
    "^[./]",
  ],
};

export default config;

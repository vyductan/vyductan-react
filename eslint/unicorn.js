import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
  eslintPluginUnicorn.configs.recommended,
  {
    languageOptions: {
      globals: globals.builtin,
    },
    rules: {
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-nested-ternary": "off", // off beause conflict with prettier
      "unicorn/no-null": "off", // off beause sometime backend return null
    },
  },
]);

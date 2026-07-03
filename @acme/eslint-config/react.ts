import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

// Extension required: `pnpm lint` runs eslint with Node's native TS loader
// (--flag unstable_native_nodejs_ts_config), which resolves relative imports
// with ESM rules — no extensionless lookup.
import { buttonAccessibleNameRule } from "./rules/button-accessible-name.ts";

export const reactConfig = defineConfig(
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat["jsx-runtime"],
    languageOptions: {
      ...reactPlugin.configs.flat.recommended?.languageOptions,
      ...reactPlugin.configs.flat["jsx-runtime"]?.languageOptions,
      globals: {
        React: "writable",
      },
    },
  },
  reactHooks.configs.flat["recommended-latest"],
  {
    files: ["**/*.tsx"],
    plugins: {
      "acme-a11y": {
        rules: { "button-accessible-name": buttonAccessibleNameRule },
      },
    },
    rules: {
      // "warn" while existing violations are cleaned up; bump to "error" after.
      "acme-a11y/button-accessible-name": "warn",
    },
  },
);

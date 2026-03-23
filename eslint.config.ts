import { defineConfig } from "eslint/config";

import { baseConfig } from "@acme/eslint-config/base";

export default defineConfig([
  {
    ignores: [
      "**/*.json",
      "node_modules/**",
      ".next/**",
      "dist/**",
      ".turbo/**",
      ".cache/**",
      "pnpm-lock.yaml",
      "turbo.json",
      "pnpm-workspace.yaml",
    ],
  },
  ...baseConfig,
]);

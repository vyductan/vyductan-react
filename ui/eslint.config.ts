import { defineConfig } from "eslint/config";

import { baseConfig } from "@acme/eslint-config/base";
import { reactConfig } from "@acme/eslint-config/react";

export default defineConfig([
  {
    ignores: ["dist/**", "./src/shadcn/*.tsx", "./src/hooks/use-mobile.ts"],
  },
  ...baseConfig,
  ...reactConfig,
]);

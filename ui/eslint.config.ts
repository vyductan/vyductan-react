// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import { defineConfig } from "eslint/config";

import { baseConfig } from "@acme/eslint-config/base";
import { reactConfig } from "@acme/eslint-config/react";
import { nextjsConfig } from "@acme/eslint-config/nextjs";

export default defineConfig([
  {
    ignores: [
      "dist/**",
      "./src/shadcn/*.tsx",
      "./src/hooks/use-mobile.ts",
      "!.storybook",
    ],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...storybook.configs["flat/recommended"],
]);

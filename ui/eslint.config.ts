// TODO: Re-enable eslint-plugin-storybook when it supports ESLint 10
// See: https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import { defineConfig } from "eslint/config";

import { baseConfig } from "@acme/eslint-config/base";
import { nextjsConfig } from "@acme/eslint-config/nextjs";
import { reactConfig } from "@acme/eslint-config/react";

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
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
]);

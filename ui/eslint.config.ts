// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig } from "eslint/config";

import { baseConfig } from "@acme/eslint-config/base";
import { reactConfig } from "@acme/eslint-config/react";

export default defineConfig([
  {
    ignores: ["dist/**", "./src/shadcn/*.tsx", "./src/hooks/use-mobile.ts", "!.storybook"],
  },
  ...baseConfig,
  ...reactConfig,
  // storybook.configs['flat/recommended'],
  // ...storybook.configs["flat/recommended"],
  // {
  //   languageOptions: {
  //     parserOptions: {
  //       tsconfigRootDir: import.meta.dirname,
  //       allowDefaultProject: [".storybook/**"],
  //     },
  //   },
  // },
]);

import baseConfig from "@acme/eslint-config/base";
import reactConfig from "@acme/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**", "src/shadcn/chart.tsx"],
  },
  ...baseConfig,
  ...reactConfig,
];

import * as path from "node:path";
import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import turboPlugin from "eslint-plugin-turbo";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * All packages that leverage t3-env should use this rule
 */
export const restrictEnvAccess = defineConfig(
  { ignores: ["**/env.ts"] },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "Use `import { env } from '~/env'` instead to ensure validated types.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          name: "process",
          importNames: ["env"],
          message:
            "Use `import { env } from '~/env'` instead to ensure validated types.",
        },
      ],
    },
  },
);

export const baseConfig = defineConfig(
  eslintPluginUnicorn.configs.recommended,
  // Ignore files not tracked by VCS and any config files
  includeIgnoreFile(path.join(import.meta.dirname, "../../.gitignore")),
  { ignores: ["**/*.config.*"] },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    plugins: {
      import: importPlugin,
      turbo: turboPlugin,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      // Disabled for performance - these require TypeScript project service
      // ...tseslint.configs.recommendedTypeChecked,
      // ...tseslint.configs.stylisticTypeChecked,
      ...tseslint.configs.stylistic,
    ],
    rules: {
      ...turboPlugin.configs.recommended.rules,
      /*
       * t3-turbo
       */
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      // Type-aware rule disabled for performance
      // Run `pnpm typecheck` instead for type checking
      // "@typescript-eslint/no-misused-promises": [
      //   "error",
      //   {
      //     checksVoidReturn: { attributes: false },
      //   },
      // ],
      // Type-aware rule disabled for performance
      // Run `pnpm typecheck` instead for type checking
      // "@typescript-eslint/no-unnecessary-condition": [
      //   "error",
      //   {
      //     allowConstantLoopConditions: true,
      //   },
      // ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],

      /*
       * t3
       */
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      // "@typescript-eslint/consistent-type-imports": [
      //   "warn",
      //   { prefer: "type-imports", fixStyle: "inline-type-imports" },
      // ],
      // "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/require-await": "off",
      //   "@typescript-eslint/no-misused-promises": [
      //   "error",
      //   { checksVoidReturn: { attributes: false } },
      // ],

      /*
       * Nextjs
       * that rules allowed by Nextjs
       */
      // // "@typescript-eslint/unbound-method": "off",
      // // "@typescript-eslint/no-non-null-assertion": "error",
      // // "@typescript-eslint/prefer-nullish-coalescing": "off",
      // "@typescript-eslint/no-unsafe-assignment": "off",
      // "@typescript-eslint/no-unsafe-argument": "off",
      // "@typescript-eslint/no-explicit-any": "off",

      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-nested-ternary": "off", // off beause conflict with prettier
      "unicorn/no-null": "off", // off beause sometime backend return null
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: [
            "^-[a-z0-9-]+(\\.[a-z0-9-]+)*$", // Allow leading dash
          ],
        },
      ],
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    // Disabled for performance - enables TypeScript type-checking during linting
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);

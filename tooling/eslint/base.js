// https://github.com/t3-oss/create-t3-app/blob/main/cli/template/base/_eslintrc.cjs
const { fileURLToPath } = require("url");

/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    "turbo",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "prettier",
    "canonical",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint", "import", "canonical"],
  rules: {
    "prettier/prettier": "off",
    // canonical
    // "canonical/sort-keys": "off",
    // "canonical/import-specifier-newline": "off",
    // "canonical/export-specifier-newline": "off",
    "canonical/no-barrel-import": "error",

    // ------
    // t3
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: { attributes: false },
      },
    ],

    // t3-turbo
    "turbo/no-undeclared-env-vars": "off",
    // "@typescript-eslint/no-unused-vars": [
    //   "error",
    //   { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    // ],
    // "@typescript-eslint/consistent-type-imports": [
    //   "warn",
    //   { prefer: "type-imports", fixStyle: "separate-type-imports" },
    // ],
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],

    /**
     * @tim-w-james (override)
     */
    // "import/no-default-export": "off",
    // "jsdoc/require-jsdoc": "off",
    // "simple-import-sort/imports": "off",
    // "filename-rules/match": [
    //   "error",
    //   {
    //     ".ts": "camelcase",
    //     ".tsx": /^(index|main|page)\.tsx|[A-Z][a-z0-9]+\.tsx$/,
    //   },
    // ],
    // "@typescript-eslint/naming-convention": [
    //   "warn",
    //   {
    //     selector: "default",
    //     format: ["camelCase"],
    //     leadingUnderscore: "allow",
    //   },
    //   {
    //     selector: "variable",
    //     // Need to allow PascalCase for React components
    //     format: ["PascalCase", "camelCase", "UPPER_CASE"],
    //     leadingUnderscore: "allow",
    //   },
    //   {
    //     selector: "parameter",
    //     format: ["camelCase"],
    //     leadingUnderscore: "allow",
    //   },
    //   {
    //     selector: "property",
    //     format: null,
    //     leadingUnderscore: "allow",
    //   },
    //   {
    //     selector: "typeLike",
    //     format: ["PascalCase"],
    //   },
    //   {
    //     selector: "enumMember",
    //     format: ["PascalCase"],
    //   },
    // ],
  },
  ignorePatterns: [
    "**/.eslintrc.cjs",
    "**/*.config.js",
    "**/*.config.cjs",
    ".next",
    "dist",
    "pnpm-lock.yaml",
  ],
  reportUnusedDisableDirectives: true,
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        project: fileURLToPath(
          new URL("../typescript/base.json", "file://" + __filename),
        ),
      },
    },
  },
};

module.exports = config;

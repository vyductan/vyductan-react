const { fileURLToPath } = require("url");
/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    "turbo",
    "prettier",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:react-hooks/recommended",
    "canonical",
  ],

  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint", "import"],
  rules: {
    // canonical
    // "canonical/sort-keys": "off",
    // "canonical/import-specifier-newline": "off",
    // "canonical/export-specifier-newline": "off",

    "canonical/no-barrel-import": "error",

    // t3
    "@typescript-eslint/array-type": "off",

    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        fixStyle: "inline-type-imports",
        prefer: "type-imports",
      },
    ],
    "@typescript-eslint/no-misused-promises": [
      "error",
      { checksVoidReturn: { attributes: false } },
    ],

    "@typescript-eslint/no-unsafe-assignment": "error",
    // t3-turbo
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
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

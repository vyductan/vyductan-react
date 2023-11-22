/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  rules: {
    "react/prop-types": "off",
  },
  globals: {
    React: "writable",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
  },
  // overrides: [
  //   // Next.js needs default exports for pages and API points
  //   {
  //     files: ["App.tsx", "*/pages/*", "*/pages/api/*"],
  //     rules: {
  //       "import/no-default-export": "off",
  //     },
  //   },
  // ],
};

module.exports = config;

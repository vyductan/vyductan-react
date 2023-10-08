/** @type {import("eslint").Linter.Config} */
const config = {
  overrides: [
    // Next.js needs default exports for pages and API points
    {
      files: ["App.tsx", "*/pages/*", "*/pages/api/*"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
};

module.exports = config;

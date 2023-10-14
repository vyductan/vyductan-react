/** @type {import('eslint').Linter.Config} */
const config = {
  extends: [
    // "next/core-web-vitals",
    "plugin:@next/next/recommended",
  ],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
  },
};

module.exports = config;

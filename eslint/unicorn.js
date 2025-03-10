import eslintPluginUnicorn from "eslint-plugin-unicorn";

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
  eslintPluginUnicorn.configs.recommended,
  {
    rules: {
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-nested-ternary": "off", // off beause conflict with prettier
      "unicorn/no-null": "off", // off beause sometime backend return null
    },
  },
];

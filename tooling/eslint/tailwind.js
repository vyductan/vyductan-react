/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ["plugin:tailwindcss/recommended"],
  settings: {
    tailwindcss: {
      callees: ["clsm", "cva", "cx"],
      config: "../tailwind/index.ts",
    },
  },
};

module.exports = config;

const { fileURLToPath } = require("url");

/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ["plugin:tailwindcss/recommended"],
  settings: {
    tailwindcss: {
      callees: ["clsm", "cva", "cx"],
      config: fileURLToPath(
        new URL("../../theme/index.ts", "file://" + __filename),
      ),
      cssFiles: [
        "**/*.{css,scss}",
        "!**/node_modules",
        "!**/.*",
        "!**/dist",
        "!**/build",
      ],
    },
  },
};

module.exports = config;

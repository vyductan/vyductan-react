/// <reference types="vitest/config" />
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// const dirname =
//   typeof __dirname !== "undefined"
//     ? __dirname
//     : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const __dirname = dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./.storybook/vitest-setup.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(__dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@acme/ui": resolve(__dirname, "./src"),
      "@acme/ui/*": resolve(__dirname, "./src/ui/*"),
      "@/lib/*": resolve(__dirname, "./src/lib/*"),
      "@/hooks/*": resolve(__dirname, "./src/hooks/*"),
      "@/components/ui": resolve(__dirname, "./src/components/index.ts"),
      "@/components/ui/*": resolve(__dirname, "./src/components/*"),
      "@/components/icons": resolve(__dirname, "./src/icons/index.ts"),
      "@/components/icons/*": resolve(__dirname, "./src/icons/*"),
    },
  },
});

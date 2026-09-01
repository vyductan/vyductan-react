import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  resolve: {
    alias: {
      "@acme/ui": resolve(dirname, "./src"),
      "@acme/ui/shadcn": resolve(dirname, "./src/shadcn"),
      "@acme/ui/lib": resolve(dirname, "./src/lib"),
      "@acme/ui/lib/utils": resolve(dirname, "./src/lib/utils.ts"),
      "@acme/ui/shadcn/button-group": resolve(
        dirname,
        "./src/shadcn/button-group.tsx",
      ),
    },
  },
  test: {
    // globals: true,
    // environment: "jsdom",
    // setupFiles: ["./.storybook/vitest-setup.ts"],
    // include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    // coverage: {
    //   provider: "v8",
    //   reporter: ["text", "json", "html"],
    // },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          // *.touch.test.tsx needs a real device context — see the `touch`
          // project below. jsdom has no layout and no media queries, so running
          // them here would only ever produce false passes.
          exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "src/**/*.touch.test.{ts,tsx}",
            "src/**/*.browser.test.{ts,tsx}",
          ],
        },
      },
      {
        // Real browser INPUT, not synthetic DOM events. `storybook/test` and
        // `@testing-library/user-event` both dispatch events straight at the
        // DOM, so a story cannot tell whether the browser's own key delivery
        // reaches the page — which is exactly the gap that matters for Escape
        // routing. Vitest's browser `userEvent` goes through Playwright/CDP.
        extends: true,
        plugins: [tailwindcss()],
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.{ts,tsx}"],
          setupFiles: ["./vitest-setup.touch.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        // Capability media queries (`pointer`, `any-pointer`, `hover`) describe
        // the DEVICE, so they can only be exercised by a browser context that
        // was created as one. Chromium flips `any-pointer` to coarse from
        // `hasTouch` alone — `isMobile` is not needed.
        extends: true,
        plugins: [tailwindcss()],
        test: {
          name: "touch",
          include: ["src/**/*.touch.test.{ts,tsx}"],
          setupFiles: ["./vitest-setup.touch.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ contextOptions: { hasTouch: true } }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        extends: true,
        // Don't extend root config to avoid inheriting include pattern
        // Storybook 8.5.0+ uses stories field from Storybook config instead
        plugins: [
          // tailwindcss(),

          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
            storybookScript: "pnpm storybook --no-open",
          }),
        ],
        test: {
          name: "storybook",
          // globals: true,
          // No include - Storybook 8.5.0+ uses stories field from Storybook config
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
        },
      },
    ],
  },
  // resolve: {
  //   alias: {
  //     "@acme/ui": resolve(__dirname, "./src"),
  //     "@acme/ui/shadcn": resolve(__dirname, "./src/shadcn"),
  //     "@acme/ui/lib": resolve(__dirname, "./src/lib"),
  //     "@acme/ui/lib/utils": resolve(__dirname, "./src/lib/utils.ts"),
  //     "@acme/ui/shadcn/button-group": resolve(__dirname, "./src/shadcn/button-group.tsx"),
  //     // // "@acme/ui/*": resolve(__dirname, "./src/ui/*"),
  //     // // "@acme/ui/shadcn/*": resolve(__dirname, "../xxx/src/shadcn/*"),
  //     // "@acme/lib": resolve(__dirname, "./src/lib"),
  //     // // "@/lib/*": resolve(__dirname, "./src/lib/*"),
  //     // "@/hooks/*": resolve(__dirname, "./src/hooks/*"),
  //     // "@acme/ui/components": resolve(__dirname, "./src/components/index.ts"),
  //     // "@acme/ui/components/*": resolve(__dirname, "./src/components/*"),
  //     // "@/components/icons": resolve(__dirname, "./src/icons/index.ts"),
  //     // "@/components/icons/*": resolve(__dirname, "./src/icons/*"),
  //   },
  // },
  // server: {
  //   fs: {
  //     // Allow serving files from node_modules and Storybook cache
  //     // This is needed for browser tests to access pre-bundled dependencies
  //     allow: [
  //       "..",
  //       resolve(__dirname, "node_modules"),
  //       resolve(__dirname, "node_modules/.cache"),
  //     ],
  //   },
  // },
});

import { defineConfig } from "playwright/test";

export default defineConfig({
  testDir: "./playwright",
  testMatch: [
    "editor-notion-clipboard.spec.mjs",
    "dialog-page-selection.spec.mjs",
    "dialog-open-selection.spec.mjs",
    "dialog-body-selection.spec.mjs",
    "modal-title-selection.spec.mjs",
    "modal-trigger-selection.spec.mjs",
    "dialog-selection.spec.mjs",
  ],
  timeout: 120000,
  workers: 1,
  use: {
    headless: true,
  },
});

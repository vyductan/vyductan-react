import { defineConfig } from "playwright/test";

export default defineConfig({
  testDir: './playwright',
  testMatch: ['editor-notion-clipboard.spec.mjs'],
  timeout: 120000,
  workers: 1,
  use: {
    headless: true,
  },
});

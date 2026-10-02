import { describe, expect, it, vi } from "vitest";

// Regression: the transformers that convert their own contents imported the
// lists they belong to, so entering the module graph through one of them read
// TABLE before it was initialized — "Cannot access 'TABLE' before
// initialization", which took down the lazily loaded English word form in
// production. Each entry point must load on its own, in a fresh registry.
describe("markdown transformer modules", () => {
  it.each([
    "./markdown-table-transformer",
    "./markdown-nfm-table-transformer",
    "./markdown-nfm-blocks-transformer",
    "./markdown-nfm-raw-transformer",
    "./markdown-transformers",
  ])("load when %s is imported first", async (entry) => {
    vi.resetModules();
    await expect(import(/* @vite-ignore */ entry)).resolves.toBeDefined();
    const { MARKDOWN_TRANSFORMERS } = await import("./markdown-transformers");
    expect(MARKDOWN_TRANSFORMERS.every(Boolean)).toBe(true);
  });
});

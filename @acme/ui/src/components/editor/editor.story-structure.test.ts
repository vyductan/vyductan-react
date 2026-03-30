import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "vitest";

test("editor stories expose the playground example as a dedicated story", () => {
  const storiesSource = readFileSync(
    resolve(import.meta.dirname, "./editor.stories.tsx"),
    "utf8",
  );

  expect(storiesSource).toContain(
    'import PlaygroundDemo from "./examples/playground";',
  );
  expect(storiesSource).toContain("export const Playground: Story = {");
  expect(storiesSource).toContain("render: () => <PlaygroundDemo />");
});

test("ui package exposes a reusable notion clipboard retest command", () => {
  const packageJson = readFileSync(resolve(import.meta.dirname, "../../../package.json"), "utf8");

  expect(packageJson).toContain(
    '"test:editor:notion-clipboard": "playwright test --config ./playwright.editor-clipboard.config.mjs"',
  );
});

test("ui package defines a dedicated playwright config for notion clipboard retests", () => {
  const configSource = readFileSync(
    resolve(import.meta.dirname, "../../../playwright.editor-clipboard.config.mjs"),
    "utf8",
  );

  expect(configSource).toContain("testDir: './playwright'");
  expect(configSource).toContain("workers: 1");
});

test("notion retest keeps the optional Notion step inside the test body", () => {
  const specSource = readFileSync(
    resolve(import.meta.dirname, "../../../playwright/editor-notion-clipboard.spec.mjs"),
    "utf8",
  );

  expect(specSource).toContain(
    'test("pastes the verified clipboard payloads into Notion", async () => {',
  );
  expect(specSource).toContain('  test.skip(');
  expect(specSource).toContain('!RUN_NOTION_E2E || !NOTION_PAGE_URL');
  expect(specSource).toContain(
    'Set RUN_NOTION_E2E=1 and NOTION_PAGE_URL to enable the live Notion check.',
  );
  expect(specSource).not.toContain(
    'test.skip(!RUN_NOTION_E2E || !NOTION_PAGE_URL, "pastes the verified clipboard payloads into Notion", async () => {',
  );
});

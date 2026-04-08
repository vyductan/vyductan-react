import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("AlertModal docs Storybook config", () => {
  test("attaches MDX docs to the AlertModal stories tree so the sidebar stays grouped", () => {
    const docsSource = readFileSync(
      path.resolve(import.meta.dirname, "./alert-modal.mdx"),
      "utf8",
    );

    expect(docsSource).toContain('import * as AlertModalStories from "./alert-modal.stories"');
    expect(docsSource).toContain("<Meta of={AlertModalStories} />");
  });
});

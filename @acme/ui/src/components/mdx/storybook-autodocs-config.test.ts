import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const storyFilesWithRemovedLocalAutodocs = [
  "avatar/avatar.stories.tsx",
  "button-group/button-group.stories.tsx",
  "color-picker/color-picker-oklch.stories.tsx",
  "divider/divider.stories.tsx",
  "editor/editor-table-action-menu.stories.tsx",
  "editor/editor.stories.tsx",
  "grid/grid.stories.tsx",
  "input/input-number.stories.tsx",
  "input/input.stories.tsx",
  "message/message.stories.tsx",
  "tag/tag-with-count.stories.tsx",
] as const;

function readUtf8(filePath: string) {
  return readFileSync(filePath, "utf8");
}

describe("Storybook global autodocs config", () => {
  test("enables autodocs globally from preview config", () => {
    const previewSource = readUtf8(
      path.resolve(import.meta.dirname, "../../../.storybook/preview.tsx"),
    );

    expect(previewSource).toMatch(/tags:\s*\[\s*"autodocs"\s*\]/);
  });

  test("does not keep redundant local autodocs opt-ins once preview owns docs", () => {
    const componentsRoot = path.resolve(import.meta.dirname, "..");

    for (const relativePath of storyFilesWithRemovedLocalAutodocs) {
      const storySource = readUtf8(path.resolve(componentsRoot, relativePath));

      expect(storySource).not.toMatch(/tags:\s*\[\s*"autodocs"\s*\]/);
    }
  });
});

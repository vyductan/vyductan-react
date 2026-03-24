import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("Segmented source structure", () => {
  test("does not animate all properties on trigger state changes", () => {
    const source = readFileSync(
      resolve(import.meta.dirname, "./segmented.tsx"),
      "utf8",
    );

    expect(source).not.toContain("transition-all");
  });

  test("defines segmented stories for playground and background inspection", () => {
    const storyPath = resolve(import.meta.dirname, "./segmented.stories.tsx");

    expect(existsSync(storyPath)).toBe(true);

    const source = readFileSync(storyPath, "utf8");

    expect(source).toContain('title: "Components/Segmented"');
    expect(source).toContain("export const Playground");
    expect(source).toContain("export const BackgroundContrast");
    expect(source).toContain("export const Block");
  });
});

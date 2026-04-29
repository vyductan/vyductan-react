import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const storySource = () =>
  readFileSync(path.resolve(import.meta.dirname, "./form.stories.tsx"), "utf8");

describe("Form stories", () => {
  test("exposes the AntD basic payment example", () => {
    const source = storySource();

    expect(source).toContain("./examples/antd-basic");
    expect(source).toContain("export const AntdBasic");
  });
});

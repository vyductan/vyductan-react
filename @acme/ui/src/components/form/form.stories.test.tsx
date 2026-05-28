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

  test("exposes the basic shadcn payment example", () => {
    const source = storySource();

    expect(source).toContain("./examples/basic-shadcn");
    expect(source).toContain("export const BasicShadcn");
    expect(source).not.toContain("./examples/shadcn");
  });
});

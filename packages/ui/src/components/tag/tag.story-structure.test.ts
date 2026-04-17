import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

describe("Tag story structure", () => {
  test("keeps the Colorful example wired through the examples-first Storybook pattern", () => {
    const storiesPath = path.resolve(
      import.meta.dirname,
      "./tag.stories.tsx",
    );
    const examplePath = path.resolve(
      import.meta.dirname,
      "./examples/colorful.tsx",
    );

    expect(existsSync(storiesPath)).toBe(true);
    expect(existsSync(examplePath)).toBe(true);

    const storiesSource = readFileSync(storiesPath, "utf8");

    expect(storiesSource).toContain('import ColorfulExample from "./examples/colorful"');
    expect(storiesSource).toContain("export const Colorful");
    expect(storiesSource).not.toContain("bordered:");
    expect(storiesSource).toMatch(
      /<ComponentSource[\s\S]*src="tag\/examples\/colorful\.tsx"[\s\S]*__comp__=\{ColorfulExample\}[\s\S]*\/>/,
    );
  });
});

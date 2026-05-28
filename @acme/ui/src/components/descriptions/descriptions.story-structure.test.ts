import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("Descriptions story structure", () => {
  test("keeps the Metadata story wired through an example file", () => {
    const storiesPath = path.resolve(
      import.meta.dirname,
      "./descriptions.stories.tsx",
    );
    const examplePath = path.resolve(
      import.meta.dirname,
      "./examples/metadata.tsx",
    );

    expect(existsSync(storiesPath)).toBe(true);
    expect(existsSync(examplePath)).toBe(true);

    const storiesSource = readFileSync(storiesPath, "utf8");

    expect(storiesSource).toContain(
      'import MetadataExample from "./examples/metadata";',
    );
    expect(storiesSource).toContain("export const Metadata: Story = {");
    expect(storiesSource).toContain("render: () => <MetadataExample />");
    expect(storiesSource).not.toContain("metadataLabelClassName");
  });
});

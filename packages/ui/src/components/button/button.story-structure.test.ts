import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

const reusedVisualStories = [
  {
    importStatement: 'import SizesDemo from "./examples/sizes";',
    storyName: "Sizes",
    renderPattern: "render: () => <SizesDemo />",
  },
  {
    importStatement: 'import WithIconDemo from "./examples/with-icon";',
    storyName: "WithIcon",
    renderPattern: "render: () => <WithIconDemo />",
  },
  {
    importStatement: 'import IconDemo from "./examples/icon";',
    storyName: "IconOnly",
    renderPattern: "render: () => <IconDemo />",
  },
  {
    importStatement: 'import LoadingDemo from "./examples/loading";',
    storyName: "Loading",
    renderPattern: "render: () => <LoadingDemo />",
  },
  {
    importStatement: 'import DisabledDemo from "./examples/disabled";',
    storyName: "Disabled",
    renderPattern: "render: () => <DisabledDemo />",
  },
] as const;

test("button visual stories reuse shared example components", () => {
  const storiesSource = readFileSync(
    path.resolve(import.meta.dirname, "./button.stories.tsx"),
    "utf8",
  );

  for (const {
    importStatement,
    storyName,
    renderPattern,
  } of reusedVisualStories) {
    expect(storiesSource).toContain(importStatement);
    expect(storiesSource).toContain(`export const ${storyName}: Story = {`);
    expect(storiesSource).toContain(renderPattern);
  }
});

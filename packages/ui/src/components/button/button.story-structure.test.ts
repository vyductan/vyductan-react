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
  {
    importStatement: 'import CopyButtonDemo from "./examples/copy-button";',
    storyName: "CopyButton",
    renderPattern: "render: () => <CopyButtonDemo />",
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

test("copy button example keeps the copy control icon-only and visually stable", () => {
  const copyButtonSource = readFileSync(
    path.resolve(import.meta.dirname, "./examples/copy-button.tsx"),
    "utf8",
  );

  expect(copyButtonSource).toContain('type="default"');
  expect(copyButtonSource).toContain('shape="icon"');
  expect(copyButtonSource).not.toContain('type={isCopied ? "primary" : "default"}');
  expect(copyButtonSource).not.toContain("{getCopyButtonLabel(copyState)}");
});

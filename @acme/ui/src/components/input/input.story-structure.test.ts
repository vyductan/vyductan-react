import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

const storiesPath = path.resolve(import.meta.dirname, "./input.stories.tsx");

// ComponentSource looks `src` up in an import.meta.glob map and falls back to
// printing the path itself when it misses, so a stale or misspelled path renders
// a green story whose "code sample" is just the path. Resolve the paths here
// instead of in a play function: shiki highlights in an effect, which made the
// equivalent browser assertion flake once the full suite ran in parallel.
test("input stories point ComponentSource at example files that exist", () => {
  const storiesSource = readFileSync(storiesPath, "utf8");
  const sources = [
    ...storiesSource.matchAll(/<ComponentSource\s+src="([^"]+)"/g),
  ].map((match) => match[1]!);

  expect(sources.length).toBeGreaterThan(0);

  for (const source of sources) {
    const absolute = path.resolve(import.meta.dirname, "..", source);
    expect(existsSync(absolute), `${source} does not exist`).toBe(true);
  }
});

test("input addon stories render the shared examples rather than inline copies", () => {
  const storiesSource = readFileSync(storiesPath, "utf8");

  for (const [storyName, example] of [
    ["WithAddons", "input/examples/addon.tsx"],
    ["AddonSizes", "input/examples/addon-sizes.tsx"],
  ] as const) {
    const story = storiesSource.slice(
      storiesSource.indexOf(`export const ${storyName}: Story = {`),
    );

    expect(story).toContain(`src="${example}"`);
  }
});

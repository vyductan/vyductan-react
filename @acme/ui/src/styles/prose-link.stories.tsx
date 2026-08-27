import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

/**
 * `@tailwindcss/typography` ships its own near-black link color, and `.prose`
 * lands in the components layer while the global anchor rule is in base — so
 * prose wins on layer order and published rich text gets black links while the
 * rest of the page follows `--color-link`.
 *
 * globals.css repoints the plugin's variables at the token. Asserting it needs a
 * browser: the value only exists after the cascade resolves, so nothing in jsdom
 * would notice a regression here.
 */
function ProseSample() {
  return (
    <div className="prose prose-sm max-w-none">
      <p>
        Meeting place, with a{" "}
        <a href="https://maps.example.com">Google maps link</a> in it.
      </p>
    </div>
  );
}

const meta = {
  title: "Styles/Prose Link",
  component: ProseSample,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ProseSample>;

export default meta;
type Story = StoryObj<typeof meta>;

function readLinkAndTokenColor(root: HTMLElement) {
  const link = root.querySelector("a");

  if (!link) {
    throw new Error("Expected the prose link to render");
  }

  // The expected value is probed from the same subtree so the assertion is
  // "tracks the token" rather than a hard-coded oklch.
  const probe = document.createElement("span");
  probe.className = "text-link";
  root.append(probe);
  const expected = globalThis.getComputedStyle(probe).color;
  probe.remove();

  return { actual: globalThis.getComputedStyle(link).color, expected };
}

export const FollowsLinkToken: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      expect(canvasElement.querySelector(".prose a")).toBeTruthy();
    });

    const { actual, expected } = readLinkAndTokenColor(canvasElement);

    expect(actual).toBe(expected);
  },
};

export const FollowsLinkTokenInDarkMode: Story = {
  render: () => (
    <div className="dark bg-background text-foreground p-4">
      <ProseSample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const dark = canvasElement.querySelector<HTMLElement>(".dark");

    if (!dark) {
      throw new Error("Expected the dark wrapper to render");
    }

    await waitFor(() => {
      expect(dark.querySelector(".prose a")).toBeTruthy();
    });

    const { actual, expected } = readLinkAndTokenColor(dark);

    expect(actual).toBe(expected);
  },
};

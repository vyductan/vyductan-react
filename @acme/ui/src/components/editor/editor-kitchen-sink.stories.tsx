import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Editor } from "./editor";
import { EditorRender } from "./editor-render";
import KitchenSinkDemo from "./examples/kitchen-sink";
import { kitchenSinkValue } from "./examples/kitchen-sink-document";

const meta = {
  title: "Components/Editor/Kitchen Sink",
  component: Editor,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Browse and edit the full-coverage document, then switch tabs to see the same
 * content through the published renderer.
 */
export const AllFeatures: Story = {
  render: () => <KitchenSinkDemo />,
};

/**
 * Asserts the two renderers actually agree on the kitchen-sink document, in a
 * real browser. Structure parity is covered by unit tests; what needs a browser
 * is the computed result — a color present in the markup but lost to the cascade
 * looks identical to jsdom.
 */
export const PublishedParity: Story = {
  render: () => <KitchenSinkDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const editorRoot = canvasElement.querySelector<HTMLElement>(
      '[data-lexical-editor="true"]',
    );

    if (!editorRoot) {
      throw new Error("Expected the editor to render");
    }

    await waitFor(() => {
      expect(editorRoot).toHaveTextContent("Editor kitchen sink");
    });

    const publishedPane = canvasElement.querySelector<HTMLElement>(
      '[data-state="active"][role="tabpanel"]',
    );

    if (!publishedPane) {
      throw new Error("Expected the published tab panel to render");
    }

    // Every block type in the document has to survive into the published pane.
    await waitFor(() => {
      expect(publishedPane.querySelector("h1")).toBeTruthy();
      expect(publishedPane.querySelector("blockquote")).toBeTruthy();
      expect(publishedPane.querySelector("pre code")).toBeTruthy();
      expect(publishedPane.querySelector("table th")).toBeTruthy();
      expect(publishedPane.querySelector("ol")).toBeTruthy();
      expect(publishedPane.querySelector("ul")).toBeTruthy();
      expect(publishedPane.querySelector("hr")).toBeTruthy();
      expect(publishedPane.querySelector("a[href]")).toBeTruthy();
    });

    // The palette color has to compute to the same value on both sides.
    const colorOf = (root: HTMLElement, content: string) => {
      const node = [...root.querySelectorAll<HTMLElement>("span")].find(
        (candidate) => candidate.textContent === content,
      );

      return node ? globalThis.getComputedStyle(node).color : undefined;
    };

    const editorColor = colorOf(editorRoot, "Palette red");
    const publishedColor = colorOf(publishedPane, "Palette red");

    expect(editorColor).toBeTruthy();
    expect(publishedColor).toBe(editorColor);

    // The read-only pane mounts on demand, so opening it proves it reads the
    // current value rather than a stale snapshot.
    await userEvent.click(canvas.getByRole("tab", { name: "Read-only" }));

    await waitFor(() => {
      const readOnlyPanes = canvasElement.querySelectorAll<HTMLElement>(
        '[data-lexical-editor="true"]',
      );
      expect(readOnlyPanes.length).toBeGreaterThan(1);
    });
  },
};

/**
 * Published content must follow the host's theme rather than carry baked-in
 * light-mode colors. Expected values are probed from the same `.dark` subtree at
 * runtime, so the assertion is about "tracks the token" and not about a
 * particular oklch value.
 */
export const DarkModeFollowsTheme: Story = {
  render: () => (
    <div className="dark bg-background text-foreground p-4">
      <EditorRender format="json" value={kitchenSinkValue} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const dark = canvasElement.querySelector<HTMLElement>(".dark");

    if (!dark) {
      throw new Error("Expected the dark wrapper to render");
    }

    await waitFor(() => {
      expect(dark.querySelector("pre code")).toBeTruthy();
    });

    const probe = document.createElement("div");
    probe.className = "bg-muted text-muted-foreground border-border";
    dark.append(probe);
    const probeStyle = globalThis.getComputedStyle(probe);
    const expected = {
      muted: probeStyle.backgroundColor,
      mutedForeground: probeStyle.color,
      border: probeStyle.borderTopColor,
    };
    probe.remove();

    const code = dark.querySelector<HTMLElement>("pre code");
    const quote = dark.querySelector<HTMLElement>("blockquote");
    const tableHeader = dark.querySelector<HTMLElement>("table th");

    expect(globalThis.getComputedStyle(code!).backgroundColor).toBe(
      expected.muted,
    );
    expect(globalThis.getComputedStyle(quote!).color).toBe(
      expected.mutedForeground,
    );
    expect(globalThis.getComputedStyle(quote!).borderLeftColor).toBe(
      expected.border,
    );
    expect(globalThis.getComputedStyle(tableHeader!).backgroundColor).toBe(
      expected.muted,
    );
  },
};

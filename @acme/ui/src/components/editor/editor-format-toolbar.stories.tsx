import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Editor } from "./editor";

const meta = {
  title: "Components/Editor/Format Toolbar",
  component: Editor,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DOCUMENT = `First line, to leave the bar room above.

Second line.

Select these words to see the format toolbar.`;

/** Selects the last paragraph's words, the way a drag across them would. */
async function selectLastLine(canvasElement: HTMLElement) {
  const line = await waitFor(
    () => {
      const node = canvasElement.querySelector<HTMLElement>(
        '[contenteditable="true"] p:last-of-type',
      );
      expect(node?.textContent).toContain("Select these words");
      return node!;
      // The first story of the file mounts cold; under the full suite the
      // markdown import alone has taken longer than the default second.
    },
    { timeout: 5000 },
  );
  canvasElement.querySelector<HTMLElement>('[contenteditable="true"]')!.focus();
  const range = document.createRange();
  range.selectNodeContents(line);
  const selection = globalThis.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);

  return waitFor(() => {
    const bar = canvasElement.querySelector<HTMLElement>(
      '[data-slot="format-toolbar"]',
    );
    expect(bar?.style.opacity).toBe("1");
    return bar!;
  });
}

/**
 * Notion's selection menu: the block type ("Text ›") across the top, then a
 * grid of two rows — color, bold, italic, underline, clear formatting; link,
 * strikethrough, inline code, "More" for the rest (super/subscript, inline
 * math, Ask AI, Comment, block actions). Every control is 28px.
 */
export const Compact: Story = {
  args: { format: "markdown", value: DOCUMENT },
  render: (arguments_) => (
    <div style={{ maxWidth: 720 }}>
      <Editor {...arguments_} format="markdown" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = await selectLastLine(canvasElement);
    const toolbar = within(bar);

    // Waited for: the first paint of a cold story can still be laying out.
    await waitFor(() => {
      for (const button of toolbar.getAllByRole("button")) {
        expect(button.getBoundingClientRect().height).toBe(28);
      }
    });
    expect(
      toolbar.getByRole("button", { name: "Turn into" }),
    ).toHaveTextContent("Text");
    for (const name of [
      "Text color",
      "Toggle bold",
      "Toggle italic",
      "Toggle underline",
      "Clear formatting",
      "Toggle link",
      "Toggle strikethrough",
      "Toggle code",
      "More options",
    ]) {
      expect(toolbar.getByRole("button", { name })).toBeInTheDocument();
    }
  },
};

/** Each control names itself, with its shortcut when it has one. */
export const TooltipsShowShortcuts: Story = {
  ...Compact,
  play: async ({ canvasElement }) => {
    const bar = await selectLastLine(canvasElement);

    await userEvent.hover(
      within(bar).getByRole("button", { name: "Toggle bold" }),
    );
    const tooltip = await waitFor(() => {
      const node = document.querySelector<HTMLElement>(
        '[data-slot="tooltip-content"]',
      );
      expect(node).not.toBeNull();
      return node!;
    });
    expect(tooltip.textContent).toMatch(/^Bold(⌘|Ctrl\+)B/);
  },
};

/** The rarer actions live in "More"; color and clear formatting do not. */
export const MoreHoldsTheRest: Story = {
  ...Compact,
  play: async ({ canvasElement }) => {
    const bar = await selectLastLine(canvasElement);

    await userEvent.click(
      within(bar).getByRole("button", { name: "More options" }),
    );
    const body = within(document.body);
    for (const name of ["Superscript", "Subscript", "Ask AI", "Comment"]) {
      await waitFor(() =>
        expect(
          body
            .getAllByRole("menuitem")
            .some((item) => item.textContent?.trim().startsWith(name)),
        ).toBe(true),
      );
    }
    const labels = body
      .getAllByRole("menuitem")
      .map((item) => item.textContent?.trim() ?? "");
    expect(labels).not.toContain("Color");
    expect(labels.some((label) => label.startsWith("Clear formatting"))).toBe(
      false,
    );
  },
};

/** The panel is narrow already, so a narrow editor costs it no controls. */
export const Narrow: Story = {
  args: { format: "markdown", value: DOCUMENT },
  render: (arguments_) => (
    <div style={{ width: 240 }}>
      <Editor {...arguments_} format="markdown" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = await selectLastLine(canvasElement);

    for (const name of [
      "Toggle underline",
      "Toggle strikethrough",
      "Toggle code",
    ]) {
      expect(within(bar).getByRole("button", { name })).toBeInTheDocument();
    }
  },
};

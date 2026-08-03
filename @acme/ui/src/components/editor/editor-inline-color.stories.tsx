import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { Editor } from "./editor";
import InlineColorDemo from "./examples/inline-color";

const meta = {
  title: "Components/Editor/Inline Color",
  component: Editor,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

const COLORED_TEXT = "Colored text";
const EXPECTED_COLOR = "rgb(235, 87, 87)";

/**
 * Lexical and `EditorRender` are separate renderers, so inline color parity can
 * only be proven where both actually paint: a real browser. This asserts on
 * computed styles rather than attributes, which is what catches a color that is
 * present in the markup but overridden by the cascade.
 */
export const Parity: Story = {
  render: () => <InlineColorDemo />,
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const coloredNodes = [
        ...canvasElement.querySelectorAll<HTMLElement>("span"),
      ].filter((node) => node.textContent === COLORED_TEXT);

      // One from the editor, one from the published view.
      expect(coloredNodes).toHaveLength(2);

      for (const node of coloredNodes) {
        expect(globalThis.getComputedStyle(node).color).toBe(EXPECTED_COLOR);
      }
    });

    const highlighted = [
      ...canvasElement.querySelectorAll<HTMLElement>("span"),
    ].filter((node) => node.textContent === "highlighted text");

    expect(highlighted).toHaveLength(2);

    for (const node of highlighted) {
      expect(globalThis.getComputedStyle(node).backgroundColor).toBe(
        "rgb(255, 243, 191)",
      );
    }
  },
};

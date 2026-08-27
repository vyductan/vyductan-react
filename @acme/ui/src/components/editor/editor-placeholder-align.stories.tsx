import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { Editor } from "./editor";

const meta = {
  title: "Components/Editor/Placeholder Alignment",
  component: Editor,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The placeholder box spans the whole field, so its border box says nothing
 * about where the prompt actually starts. Measure the text itself.
 */
function textBoxOf(element: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect();
}

/** Where the caret lands in an empty field: the editable's content-box origin. */
function caretOriginOf(editable: HTMLElement) {
  const box = editable.getBoundingClientRect();
  const style = globalThis.getComputedStyle(editable);
  return {
    left: box.left + Number.parseFloat(style.paddingLeft),
    top: box.top + Number.parseFloat(style.paddingTop),
  };
}

/**
 * The placeholder is absolutely positioned over the editable, so its inset has
 * to track the editable's padding. When they drift the caret sits at one x and
 * the prompt text starts at another, which reads as a broken field.
 */
export const PlaceholderSitsWhereTheCaretWill: Story = {
  args: { variant: "simple" },
  play: async ({ canvasElement }) => {
    const placeholder = await waitFor(() => {
      const node = canvasElement.querySelector(
        '[data-slot="editor-placeholder"]',
      );
      if (!node) throw new Error("placeholder never rendered");
      return node as HTMLElement;
    });

    const editable = canvasElement.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    if (!editable) throw new Error("editable never rendered");

    const caret = caretOriginOf(editable);
    const placeholderBox = textBoxOf(placeholder);

    expect(Math.abs(placeholderBox.left - caret.left)).toBeLessThan(2);
    // Looser on the vertical: a Range reports the text's font box while the
    // content-box origin is the line box, so the two differ by the half-leading
    // (~3px at this size) even when they render on the same line. The horizontal
    // assertion is the one that catches the drift.
    expect(Math.abs(placeholderBox.top - caret.top)).toBeLessThan(5);
  },
};

/**
 * The inset is hard-coded to the default padding, so it is a second source of
 * truth for the same number. Any consumer that retunes `contentClassName` — and
 * a compact surface always does — moves the caret without moving the prompt,
 * unless it remembers to hand-patch `placeholderClassName` too.
 */
export const PlaceholderFollowsCustomPadding: Story = {
  args: { variant: "simple", contentClassName: "px-3 py-2" },
  play: async ({ canvasElement }) => {
    const placeholder = await waitFor(() => {
      const node = canvasElement.querySelector(
        '[data-slot="editor-placeholder"]',
      );
      if (!node) throw new Error("placeholder never rendered");
      return node as HTMLElement;
    });

    const editable = canvasElement.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    if (!editable) throw new Error("editable never rendered");

    const caret = caretOriginOf(editable);
    const placeholderBox = textBoxOf(placeholder);

    expect(Math.abs(placeholderBox.left - caret.left)).toBeLessThan(2);
    // Looser on the vertical: a Range reports the text's font box while the
    // content-box origin is the line box, so the two differ by the half-leading
    // (~3px at this size) even when they render on the same line. The horizontal
    // assertion is the one that catches the drift.
    expect(Math.abs(placeholderBox.top - caret.top)).toBeLessThan(5);
  },
};

/** The composer's configuration: minimal variant, compact padding, no manual offset. */
export const PlaceholderAlignsInAMinimalEditor: Story = {
  args: { variant: "minimal", contentClassName: "px-3 py-2.5" },
  play: async ({ canvasElement }) => {
    const placeholder = await waitFor(() => {
      const node = canvasElement.querySelector(
        '[data-slot="editor-placeholder"]',
      );
      if (!node) throw new Error("placeholder never rendered");
      return node as HTMLElement;
    });

    const editable = canvasElement.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    if (!editable) throw new Error("editable never rendered");

    const caret = caretOriginOf(editable);
    const placeholderBox = textBoxOf(placeholder);

    expect(Math.abs(placeholderBox.left - caret.left)).toBeLessThan(2);
    expect(Math.abs(placeholderBox.top - caret.top)).toBeLessThan(5);
  },
};

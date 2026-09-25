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

/**
 * Where the caret lands in an empty field. Horizontally that is the editable's
 * padding edge; vertically it is the first block's line, which the theme
 * pushes down by the block's margin — so the vertical reference is the centre
 * of that line, not the padding edge.
 */
function caretOriginOf(editable: HTMLElement) {
  const box = editable.getBoundingClientRect();
  const style = globalThis.getComputedStyle(editable);
  const line = (editable.firstElementChild ?? editable).getBoundingClientRect();
  return {
    left: box.left + Number.parseFloat(style.paddingLeft),
    centreY: line.top + line.height / 2,
  };
}

/** A Range's font box and its line box share a vertical centre. */
function centreYOf(box: DOMRect) {
  return box.top + box.height / 2;
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
    expect(Math.abs(centreYOf(placeholderBox) - caret.centreY)).toBeLessThan(1);
  },
};

/**
 * The inset is hard-coded to the default padding, so it is a second source of
 * truth for the same number. Any consumer that retunes `classNames.content` —
 * and a compact surface always does — moves the caret without moving the
 * prompt, unless it remembers to hand-patch `classNames.placeholder` too.
 */
export const PlaceholderFollowsCustomPadding: Story = {
  args: { variant: "simple", classNames: { content: "px-3 py-2" } },
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
    expect(Math.abs(centreYOf(placeholderBox) - caret.centreY)).toBeLessThan(1);
  },
};

/** The composer's configuration: minimal variant, compact padding, no manual offset. */
export const PlaceholderAlignsInAMinimalEditor: Story = {
  args: { variant: "minimal", classNames: { content: "px-3 py-2.5" } },
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
    expect(Math.abs(centreYOf(placeholderBox) - caret.centreY)).toBeLessThan(1);
  },
};

/**
 * The caret does not sit at the editable's padding edge: it sits in the first
 * paragraph, which the theme gives a vertical margin (`my-1.5`). The stories
 * above measure against the padding edge with a 5px tolerance, which that 6px
 * margin slipped under — the prompt rendered a line-margin above the caret.
 *
 * Compare vertical centres instead: a Range's font box and the paragraph's
 * line box share a centre when they are on the same line, so no half-leading
 * slack is needed and the tolerance can be tight.
 */
export const PlaceholderSharesTheFirstParagraphsLine: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const placeholder = await waitFor(() => {
      const node = canvasElement.querySelector(
        '[data-slot="editor-placeholder"]',
      );
      if (!node) throw new Error("placeholder never rendered");
      return node as HTMLElement;
    });

    const paragraph = canvasElement.querySelector<HTMLElement>(
      '[contenteditable="true"] > p',
    );
    if (!paragraph) throw new Error("empty paragraph never rendered");

    const text = textBoxOf(placeholder);
    const line = paragraph.getBoundingClientRect();

    expect(
      Math.abs(text.top + text.height / 2 - (line.top + line.height / 2)),
    ).toBeLessThan(1);
  },
};

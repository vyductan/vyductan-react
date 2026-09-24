import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode } from "@lexical/rich-text";
import { $createTableNodeWithDimensions } from "@lexical/table";
import { render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "./editor";

// Spacing is layout — margins collapse, and only a real browser does that.

Object.assign(globalThis, { React });

function EditorRefPlugin({
  onReady,
}: {
  onReady: (editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);

  return null;
}

afterEach(() => document.body.replaceChildren());

async function renderBlocks() {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    const heading = (tag: "h1" | "h2" | "h3", text: string) =>
      $createHeadingNode(tag).append($createTextNode(text));
    const paragraph = (text: string) =>
      $createParagraphNode().append($createTextNode(text));

    root.append(
      heading("h2", "Opening heading"),
      paragraph("First paragraph."),
      paragraph("Second paragraph."),
      heading("h2", "Next section"),
      paragraph("Under the heading."),
      heading("h1", "Big section"),
      paragraph("After h1."),
      heading("h3", "Small section"),
      paragraph("After h3."),
    );
  });

  return waitFor(() => {
    const blocks = [
      ...document.querySelectorAll<HTMLElement>('[contenteditable="true"] > *'),
    ];
    expect(blocks).toHaveLength(9);
    return blocks;
  });
}

/** Space between the bottom of one block and the top of the next, in px. */
const gap = (above: HTMLElement, below: HTMLElement) =>
  below.getBoundingClientRect().top - above.getBoundingClientRect().bottom;

/**
 * Two paragraphs sat flush against each other and read as one paragraph with
 * a line break in it.
 */
test("separates one paragraph from the next", async () => {
  const blocks = await renderBlocks();

  expect(gap(blocks[1]!, blocks[2]!)).toBeGreaterThanOrEqual(4);
});

/**
 * A heading was as close to the text before it as to its own, so it belonged
 * to neither and marked no break. It sits well clear of what came before and
 * close to what it introduces.
 */
test("gives a heading room above and keeps it close to its section", async () => {
  const blocks = await renderBlocks();

  const above = gap(blocks[2]!, blocks[3]!);
  const below = gap(blocks[3]!, blocks[4]!);

  expect(above).toBeGreaterThan(below * 2);
  expect(above).toBeGreaterThanOrEqual(16);
});

test("gives bigger headings more room than smaller ones", async () => {
  const blocks = await renderBlocks();

  const aboveH1 = gap(blocks[4]!, blocks[5]!);
  const aboveH2 = gap(blocks[2]!, blocks[3]!);
  const aboveH3 = gap(blocks[6]!, blocks[7]!);

  expect(aboveH1).toBeGreaterThan(aboveH2);
  expect(aboveH2).toBeGreaterThan(aboveH3);
});

/** The room above a heading is for separating sections, not for the page top. */
test("does not push a note down when it opens with a heading", async () => {
  const blocks = await renderBlocks();
  const first = blocks[0]!;

  expect(Number.parseFloat(getComputedStyle(first).marginTop)).toBe(0);
});

/**
 * A table cell holds paragraphs too. The space between paragraphs is for
 * running text; inside a cell it would only make every row taller.
 */
test("leaves paragraphs inside a table cell unspaced", async () => {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    root.append($createTableNodeWithDimensions(2, 2, true));
  });

  const cellParagraph = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"] td > p, [contenteditable="true"] th > p',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  const style = getComputedStyle(cellParagraph);
  expect(Number.parseFloat(style.marginTop)).toBe(0);
  expect(Number.parseFloat(style.marginBottom)).toBe(0);
});

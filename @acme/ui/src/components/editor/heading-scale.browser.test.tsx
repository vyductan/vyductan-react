import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode } from "@lexical/rich-text";
import { render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, describe, expect, test } from "vitest";

import type { SizeType } from "../config-provider/size-context";
import { Editor } from "./editor";

// Computed sizes: a real browser's.

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

async function measure(size: SizeType) {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false} size={size}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  (editor as unknown as LexicalEditor).update(
    () => {
      const paragraph = (text: string) =>
        $createParagraphNode().append($createTextNode(text));
      $getRoot()
        .clear()
        .append(
          paragraph("Before"),
          $createHeadingNode("h1").append($createTextNode("One")),
          $createHeadingNode("h2").append($createTextNode("Two")),
          $createHeadingNode("h3").append($createTextNode("Three")),
          paragraph("Body"),
        );
    },
    { discrete: true },
  );

  const blocks = await waitFor(() => {
    const nodes = [
      ...document.querySelectorAll<HTMLElement>('[contenteditable="true"] > *'),
    ];
    expect(nodes).toHaveLength(5);
    return nodes;
  });

  const px = (value: string) =>
    Math.round(Number.parseFloat(value) * 100) / 100;
  const of = (element: HTMLElement) => {
    const style = getComputedStyle(element);
    return {
      font: px(style.fontSize),
      line: px(style.lineHeight),
      above: px(style.marginTop),
      below: px(style.marginBottom),
    };
  };

  return {
    h1: of(blocks[1]!),
    h2: of(blocks[2]!),
    h3: of(blocks[3]!),
    paragraph: of(blocks[4]!),
  };
}

describe("heading and paragraph sizes", () => {
  /**
   * A document reads exactly as before: every value the theme had in pixels,
   * at 16px, is what the ratios come to at 16px.
   */
  test("are unchanged at 16px, pixel for pixel", async () => {
    expect(await measure("large")).toStrictEqual({
      h1: { font: 30, line: 44, above: 32, below: 4 },
      h2: { font: 24, line: 36, above: 24, below: 4 },
      h3: { font: 20, line: 32, above: 16, below: 4 },
      paragraph: { font: 16, line: 24, above: 6, below: 6 },
    });
  });

  /**
   * An editor in a form draws 14px text. Headings fixed in pixels stayed at
   * 30/24/20 — a heading over twice the size of the text beside it in a small
   * field — so they now scale with the editor's text, and so do their line
   * heights and the space around them.
   */
  test("scale with the editor's text at 14px", async () => {
    expect(await measure("middle")).toStrictEqual({
      h1: { font: 26.25, line: 38.5, above: 28, below: 3.5 },
      h2: { font: 21, line: 31.5, above: 21, below: 3.5 },
      h3: { font: 17.5, line: 28, above: 14, below: 3.5 },
      paragraph: { font: 14, line: 21, above: 5.25, below: 5.25 },
    });
  });
});

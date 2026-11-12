import type { LexicalEditor, TextNode } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import { $createTableNodeWithDimensions } from "@lexical/table";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";

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

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

const blocks = (live: LexicalEditor) =>
  live.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((node) => {
        const tag = $isHeadingNode(node) ? node.getTag() : node.getType();
        return `${tag}:${node.getTextContent()}`;
      }),
  );

const caret = (live: LexicalEditor) =>
  live.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;
    const node = selection.anchor.getNode();
    const top = node.getTopLevelElement() ?? node;
    return `${top.getTextContent()}@${selection.anchor.offset}`;
  });

async function setup() {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  const root = document.querySelector<HTMLElement>('[contenteditable="true"]')!;
  root.focus();
  return { live, root };
}

function press(root: HTMLElement, key: "Backspace" | "Delete") {
  root.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
  );
}

/*
 * From the start of "Cancellation" back to the start of the page — a click
 * there, a shift+click at the top — and Backspace: the blocks above go, and
 * "Cancellation" stays the heading it was. It was joined into the first
 * block instead, and became a line of that quote.
 */
for (const key of ["Backspace", "Delete"] as const) {
  test(`${key} on blocks selected from a block's start to another's takes them whole`, async () => {
    const { live, root } = await setup();
    live.update(
      () => {
        const quote = $createQuoteNode().append($createTextNode("Ghi thô"));
        const heading = $createHeadingNode("h1").append(
          $createTextNode("Cancellation"),
        );
        $getRoot()
          .clear()
          .append(
            quote,
            $createHeadingNode("h2").append($createTextNode("Updates")),
            $createTableNodeWithDimensions(2, 2, false),
            heading,
            $createHeadingNode("h2").append($createTextNode("Planning")),
          );
        // Backward, as a shift+click above the caret makes it.
        const selection = heading.getFirstChildOrThrow<TextNode>().select(0, 0);
        selection.focus.set(quote.getFirstChildOrThrow().getKey(), 0, "text");
      },
      { discrete: true },
    );
    // A moment between the shift+click and the key, as a person leaves one.
    await new Promise((resolve) => setTimeout(resolve, 50));
    press(root, key);
    await waitFor(() =>
      expect(blocks(live)).toStrictEqual(["h1:Cancellation", "h2:Planning"]),
    );
    expect(caret(live)).toBe("Cancellation@0");
  });
}

test("a selection inside one line up to the next one's start is text, and joins as before", async () => {
  const { live, root } = await setup();
  live.update(
    () => {
      const first = $createParagraphNode().append($createTextNode("Ghi thô"));
      const heading = $createHeadingNode("h1").append(
        $createTextNode("Cancellation"),
      );
      $getRoot().clear().append(first, heading);
      const selection = first.getFirstChildOrThrow<TextNode>().select(3, 3);
      selection.focus.set(heading.getFirstChildOrThrow().getKey(), 0, "text");
    },
    { discrete: true },
  );
  press(root, "Backspace");
  await waitFor(() =>
    expect(blocks(live)).toStrictEqual(["paragraph:GhiCancellation"]),
  );
});

/*
 * From the middle of one line to the middle of another: both are highlighted
 * whole, and both go whole, as in Notion — not the text between, joined.
 */
test("a selection from inside one line to inside another takes both whole", async () => {
  const { live, root } = await setup();
  live.update(
    () => {
      const first = $createParagraphNode().append($createTextNode("Ghi thô"));
      const heading = $createHeadingNode("h1").append(
        $createTextNode("Cancellation"),
      );
      $getRoot()
        .clear()
        .append(
          first,
          heading,
          $createHeadingNode("h2").append($createTextNode("Planning")),
        );
      const selection = first.getFirstChildOrThrow<TextNode>().select(3, 3);
      selection.focus.set(heading.getFirstChildOrThrow().getKey(), 6, "text");
    },
    { discrete: true },
  );
  press(root, "Backspace");
  await waitFor(() => expect(blocks(live)).toStrictEqual(["h2:Planning"]));
  expect(caret(live)).toBe("Planning@0");
});

test("two items of a list go, the list keeps the rest", async () => {
  const { live, root } = await setup();
  live.update(
    () => {
      const one = $createListItemNode().append($createTextNode("one"));
      const two = $createListItemNode().append($createTextNode("two"));
      $getRoot()
        .clear()
        .append(
          $createListNode("bullet").append(
            one,
            two,
            $createListItemNode().append($createTextNode("three")),
          ),
        );
      const selection = one.getFirstChildOrThrow<TextNode>().select(1, 1);
      selection.focus.set(two.getFirstChildOrThrow().getKey(), 2, "text");
    },
    { discrete: true },
  );
  press(root, "Delete");
  await waitFor(() => expect(blocks(live)).toStrictEqual(["list:three"]));
  expect(caret(live)).toBe("three@0");
});

test("everything selected leaves an empty line", async () => {
  const { live, root } = await setup();
  live.update(
    () => {
      const first = $createParagraphNode().append($createTextNode("Một"));
      const last = $createParagraphNode().append($createTextNode("Hai"));
      $getRoot().clear().append(first, last);
      const selection = first.getFirstChildOrThrow<TextNode>().select(0, 0);
      selection.focus.set(last.getFirstChildOrThrow().getKey(), 3, "text");
    },
    { discrete: true },
  );
  press(root, "Backspace");
  await waitFor(() => expect(blocks(live)).toStrictEqual(["paragraph:"]));
});

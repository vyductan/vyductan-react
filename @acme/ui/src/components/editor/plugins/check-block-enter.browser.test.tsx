import type { ElementNode, LexicalEditor } from "lexical";
import * as React from "react";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isTextNode,
} from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";
import {
  $createCheckBlockNode,
  $isCheckBlockNode,
} from "../nodes/check-block-node";
import { markdownToLexicalContent } from "../utils/lexical-converter";

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

/** To-dos "a", then "b" indented once; the caret at the end of `at`. */
async function todos(at: "a" | "b", bText = "b") {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  document.querySelector<HTMLElement>('[contenteditable="true"]')!.focus();
  live.update(
    () => {
      const a = $createCheckBlockNode(false).append($createTextNode("a"));
      const b = $createCheckBlockNode(false);
      if (bText) b.append($createTextNode(bText));
      b.setIndent(1);
      $getRoot().clear().append(a, b);
      (at === "a" ? a : b).selectEnd();
    },
    { discrete: true },
  );
  return live;
}

const blocks = (live: LexicalEditor) =>
  live.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((node) => ({
        type: $isCheckBlockNode(node) ? "todo" : node.getType(),
        text: node.getTextContent(),
        indent: $isElementNode(node) ? node.getIndent() : 0,
      })),
  );

/**
 * Like Notion: Enter at the end of an indented to-do starts the next one at
 * the same indent. It started at the margin.
 */
test("Enter in an indented to-do starts the next to-do at its indent", async () => {
  const live = await todos("b");

  await userEvent.keyboard("{Enter}c");

  await waitFor(() =>
    expect(blocks(live)).toStrictEqual([
      { type: "todo", text: "a", indent: 0 },
      { type: "todo", text: "b", indent: 1 },
      { type: "todo", text: "c", indent: 1 },
    ]),
  );
});

test("Enter in the middle of an indented to-do splits it at its indent", async () => {
  const live = await todos("b", "bc");
  live.update(
    () => {
      const text = $getRoot()
        .getLastChildOrThrow<ElementNode>()
        .getFirstChild();
      if ($isTextNode(text)) text.select(1, 1);
    },
    { discrete: true },
  );

  await userEvent.keyboard("{Enter}");

  await waitFor(() =>
    expect(blocks(live)).toStrictEqual([
      { type: "todo", text: "a", indent: 0 },
      { type: "todo", text: "b", indent: 1 },
      { type: "todo", text: "c", indent: 1 },
    ]),
  );
});

/**
 * Enter on an empty indented to-do moves it out a level, as in Notion — and
 * only at the margin turns it into a plain line.
 */
test("Enter on an empty indented to-do moves it out a level first", async () => {
  const live = await todos("b", "");

  await userEvent.keyboard("{Enter}");
  await waitFor(() =>
    expect(blocks(live)).toStrictEqual([
      { type: "todo", text: "a", indent: 0 },
      { type: "todo", text: "", indent: 0 },
    ]),
  );

  await userEvent.keyboard("{Enter}");
  await waitFor(() =>
    expect(blocks(live)).toStrictEqual([
      { type: "todo", text: "a", indent: 0 },
      { type: "paragraph", text: "", indent: 0 },
    ]),
  );
});

/**
 * Like Notion: Backspace at the start of an indented to-do turns it into
 * text where it stands. It went out to the margin as well.
 */
test("Backspace on an empty indented to-do keeps its indent", async () => {
  const live = await todos("b", "");

  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(blocks(live)).toStrictEqual([
      { type: "todo", text: "a", indent: 0 },
      { type: "paragraph", text: "", indent: 1 },
    ]),
  );
});

test("Backspace at the start of an indented to-do turns it into its text", async () => {
  const live = await todos("b", "buy milk");
  live.update(
    () => {
      $getRoot().getLastChildOrThrow<ElementNode>().selectStart();
    },
    { discrete: true },
  );

  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(blocks(live)).toStrictEqual([
      { type: "todo", text: "a", indent: 0 },
      { type: "paragraph", text: "buy milk", indent: 1 },
    ]),
  );
});

/**
 * Like Notion: "- " typed on an indented line under a to-do makes a bullet
 * there, under the to-do. It went out to the margin.
 */
test("a bullet typed on an indented line keeps its indent", async () => {
  const live = await todos("a");
  live.update(
    () => {
      const line = $createParagraphNode();
      line.setIndent(1);
      $getRoot().getLastChildOrThrow().replace(line);
      line.select();
    },
    { discrete: true },
  );

  await userEvent.keyboard("- a");

  await waitFor(() =>
    expect(
      live.getEditorState().read(() => {
        const node = $getSelection()?.getNodes()[0];
        const item = node?.getParent();
        const list = item?.getParent();
        return $isListItemNode(item) && $isListNode(list)
          ? {
              text: item.getTextContent(),
              depth: item.getIndent(),
              indent: list.getIndent(),
            }
          : null;
      }),
    ).toStrictEqual({ text: "a", depth: 0, indent: 1 }),
  );
});

/**
 * Lexical nests an item by copying its list, indent and all: under an
 * indented list, the nested one was pushed a whole indent further again.
 */
test("a list nested in an indented list is not indented twice", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.setEditorState(
    live.parseEditorState(
      JSON.stringify(markdownToLexicalContent("- [ ] a\n\t- b\n\t\t- c")),
    ),
  );

  await waitFor(() => {
    const lists = [...document.querySelectorAll("ul")].filter(
      (list) => !list.querySelector("[data-check-icon]"),
    );
    expect(lists.map((list) => list.style.paddingInlineStart)).toStrictEqual([
      expect.stringContaining("1 *"),
      "",
    ]);
  });
});

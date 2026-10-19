import type { ElementNode, LexicalEditor } from "lexical";
import * as React from "react";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
} from "@lexical/list";
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
        return $isListItemNode(item)
          ? { text: item.getTextContent(), depth: item.getIndent() }
          : null;
      }),
    ).toStrictEqual({ text: "a", depth: 1 }),
  );
});

/**
 * A bullet under a to-do is the first level of bullets, a filled dot as in
 * Notion — nested only to sit under the to-do, with no item above it. One
 * nested under a real item is the second level, a circle.
 */
test("a bullet under a to-do is a filled dot", async () => {
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
      JSON.stringify(
        markdownToLexicalContent("- [ ] a\n\t- b\n\t\t- c\n\n- d\n\t- e"),
      ),
    ),
  );

  const marker = (text: string) =>
    getComputedStyle(
      [...document.querySelectorAll("li")].find(
        (item) => !item.querySelector("ul, ol") && item.textContent === text,
      )!,
    ).listStyleType;
  await waitFor(() =>
    expect(["b", "c", "d", "e"].map(marker)).toStrictEqual([
      "disc",
      "circle",
      "disc",
      "circle",
    ]),
  );
});

/**
 * With a list at the margin just below, Lexical joined the new bullet to
 * it: out at the margin again. Typed under a to-do, it is a list of its own.
 */
test("a bullet typed above a list at the margin keeps its indent", async () => {
  const live = await todos("a");
  live.update(
    () => {
      const line = $createParagraphNode();
      line.setIndent(1);
      const below = $createListNode("bullet").append(
        $createListItemNode().append($createTextNode("below")),
      );
      $getRoot().getLastChildOrThrow().replace(line);
      line.insertAfter(below);
      line.select();
    },
    { discrete: true },
  );

  await userEvent.keyboard("- a");

  await waitFor(() =>
    expect(
      live.getEditorState().read(() =>
        $getRoot()
          .getAllTextNodes()
          .map((text) => text.getParent())
          .filter($isListItemNode)
          .map((item) => `${item.getTextContent()}@${item.getIndent()}`),
      ),
    ).toStrictEqual(["a@1", "below@0"]),
  );
});

/**
 * A triple-click selects the line, and Chrome ends the selection at the
 * start of the next one: Backspace then took the to-do below into the
 * cleared line — its text joined the bullet, its checkbox gone.
 */
test("Backspace after a triple-click clears the line, the to-do below stays", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.update(
    () => {
      const code = $createTextNode("minor_unit");
      code.toggleFormat("code");
      $getRoot()
        .clear()
        .append(
          $createCheckBlockNode(true).append($createTextNode("Round USD")),
          $createListNode("bullet").append($createListItemNode().append(code)),
          $createCheckBlockNode(true).append($createTextNode("Remove it")),
        );
    },
    { discrete: true },
  );

  const line = await waitFor(() => {
    const node = [...document.querySelectorAll("li")].find(
      (item) => item.textContent === "minor_unit",
    );
    expect(node).toBeDefined();
    return node!;
  });
  await userEvent.tripleClick(line);
  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(
      blocks(live).map((block) => `${block.type}:${block.text}`),
    ).toStrictEqual(["todo:Round USD", "list:", "todo:Remove it"]),
  );
});

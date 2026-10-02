import type { ElementNode, LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTableNodeWithDimensions } from "@lexical/table";
import { render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
} from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

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
  document.body.replaceChildren();
  document.body.removeAttribute("style");
});

type Run = { text: string; code: boolean };

/**
 * A caret put in a node by a click takes the node's format, so typing there
 * continues it. select() alone leaves the selection's format at none.
 */
function $takeFormatOf(node: { getFormat(): number }) {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) selection.setFormat(node.getFormat());
}

/** A paragraph of runs, the caret at `offset` in run `at`. */
async function editorWith(runs: Run[], at: number, offset: number | "end") {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  const root = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  root.focus();
  live.update(
    () => {
      const nodes = runs.map(({ text, code }) => {
        const node = $createTextNode(text);
        if (code) node.toggleFormat("code");
        return node;
      });
      $getRoot()
        .clear()
        .append($createParagraphNode().append(...nodes));
      const target = nodes[at]!;
      const position = offset === "end" ? target.getTextContentSize() : offset;
      target.select(position, position);
      $takeFormatOf(target);
    },
    { discrete: true },
  );
  return live;
}

const runsOf = (live: LexicalEditor) =>
  live.getEditorState().read(() =>
    $getRoot()
      .getFirstChildOrThrow<ElementNode>()
      .getChildren()
      .filter($isTextNode)
      .map((node) => ({
        text: node.getTextContent(),
        code: node.hasFormat("code"),
      })),
  );

/**
 * Like Notion: at the edge of inline code, the first arrow press toward the
 * outside leaves the code without moving the caret, so what is typed next is
 * plain text beside it.
 */
test("ArrowLeft at the start of inline code types outside it", async () => {
  const live = await editorWith([{ text: "20 reconcile", code: true }], 0, 0);

  await userEvent.keyboard("{ArrowLeft}x");

  await waitFor(() =>
    expect(runsOf(live)).toStrictEqual([
      { text: "x", code: false },
      { text: "20 reconcile", code: true },
    ]),
  );
});

test("ArrowRight at the end of inline code types outside it", async () => {
  const live = await editorWith([{ text: "*/5", code: true }], 0, "end");

  await userEvent.keyboard("{ArrowRight}y");

  await waitFor(() =>
    expect(runsOf(live)).toStrictEqual([
      { text: "*/5", code: true },
      { text: "y", code: false },
    ]),
  );
});

test("ArrowLeft inside inline code, away from its edge, moves as usual", async () => {
  const live = await editorWith([{ text: "20 reconcile", code: true }], 0, 2);

  await userEvent.keyboard("{ArrowLeft}x");

  await waitFor(() =>
    expect(runsOf(live)).toStrictEqual([{ text: "2x0 reconcile", code: true }]),
  );
});

/**
 * Code with text right after it, as `stripe_secret_key_7000`✅. The first
 * ArrowRight only changed the selection's format, leaving the caret in the
 * code node; the browser's selectionchange then gave it the code's format
 * back, so every press "left" the code again and the caret never got past.
 */
test("ArrowRight at the end of inline code steps into the text after it", async () => {
  const live = await editorWith(
    [
      { text: "key_7000", code: true },
      { text: "✅", code: false },
    ],
    0,
    "end",
  );

  await userEvent.keyboard("{ArrowRight}x");

  await waitFor(() =>
    expect(runsOf(live)).toStrictEqual([
      { text: "key_7000", code: true },
      { text: "x✅", code: false },
    ]),
  );
});

test("a second ArrowRight after inline code moves on past the next character", async () => {
  const live = await editorWith(
    [
      { text: "key_7000", code: true },
      { text: "✅ done", code: false },
    ],
    0,
    "end",
  );

  await userEvent.keyboard("{ArrowRight}{ArrowRight}x");

  await waitFor(() =>
    expect(runsOf(live)).toStrictEqual([
      { text: "key_7000", code: true },
      { text: "✅x done", code: false },
    ]),
  );
});

/** As reported: a list item, the caret put after the code by a click. */
test("in a list item, after a click at the end of inline code, ArrowRight twice moves past what follows", async () => {
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
      const code = $createTextNode("stripe_secret_key_7000").toggleFormat(
        "code",
      );
      const item = $createListItemNode().append(code, $createTextNode("✅"));
      $getRoot().clear().append($createListNode("bullet").append(item));
    },
    { discrete: true },
  );
  const code = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"] code',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  const rect = code.getBoundingClientRect();
  await userEvent.click(code, {
    position: { x: rect.width - 1, y: rect.height / 2 },
  });

  await userEvent.keyboard("{ArrowRight}");
  // A selectionchange that is not from the editor's own DOM update, later
  // than 200ms after the press, as VS Code's webview delivers: Lexical then
  // takes the format back from the code node the caret is still in.
  await new Promise((resolve) => setTimeout(resolve, 250));
  document.dispatchEvent(new Event("selectionchange"));
  await new Promise((resolve) => setTimeout(resolve, 50));

  await userEvent.keyboard("{ArrowRight}x");

  await waitFor(() => {
    const item = document.querySelector("li");
    expect(item?.textContent).toBe("stripe_secret_key_7000✅x");
    expect(item?.querySelector("code")?.textContent).toBe(
      "stripe_secret_key_7000",
    );
  });
});

/** The case it was reported in: inline code at the start of a table cell. */
test("ArrowLeft at the start of inline code in a table cell types outside it, in the cell", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  const root = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  root.focus();
  live.update(
    () => {
      const table = $createTableNodeWithDimensions(2, 2, false);
      $getRoot().clear().append(table, $createParagraphNode());
      // Second row, second cell: there is a cell before it to jump to.
      const cellParagraph = table
        .getChildAtIndex<ElementNode>(1)!
        .getLastChildOrThrow<ElementNode>()
        .getFirstChildOrThrow<ElementNode>();
      const code = $createTextNode("20 reconcile").toggleFormat("code");
      cellParagraph.clear().append(code);
      code.select(0, 0);
      $takeFormatOf(code);
    },
    { discrete: true },
  );

  await userEvent.keyboard("{ArrowLeft}x");

  await waitFor(() => {
    const cell = [...document.querySelectorAll("td")].at(-1);
    expect(cell?.textContent).toBe("x20 reconcile");
    expect(cell?.querySelector("code")?.textContent).toBe("20 reconcile");
  });
});

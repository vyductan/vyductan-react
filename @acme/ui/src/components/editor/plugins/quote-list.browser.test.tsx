import type { LexicalEditor, LexicalNode } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createQuoteNode } from "@lexical/rich-text";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createTextNode, $getRoot, $isElementNode } from "lexical";
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
  cleanup();
  document.body.replaceChildren();
});

/** The document as nested types: `type` or `type:words` for a leaf line. */
function $shape(node: LexicalNode): unknown {
  if (!$isElementNode(node)) return node.getTextContent();
  const blocks = node.getChildren().filter((child) => $isElementNode(child));
  if (blocks.length === 0 || node.getType() === "listitem") {
    return `${node.getType()}:${node.getTextContent()}`;
  }
  return { [node.getType()]: blocks.map((child) => $shape(child)) };
}

const shape = (live: LexicalEditor) =>
  live.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((child) => $shape(child)),
  );

/** An editor holding one quote of `words`, the caret at its start. */
async function quoteWith(words: string) {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  await userEvent.click(
    document.querySelector<HTMLElement>('[contenteditable="true"]')!,
  );
  live.update(
    () => {
      const quote = $createQuoteNode();
      if (words) quote.append($createTextNode(words));
      $getRoot().clear().append(quote);
      quote.selectStart();
    },
    { discrete: true },
  );
  return live;
}

const listType = (live: LexicalEditor) =>
  live.getEditorState().read(() => {
    const list = $getRoot()
      .getAllTextNodes()[0]
      ?.getParentOrThrow()
      .getParentOrThrow();
    return list && "getListType" in list
      ? (list as unknown as { getListType(): string }).getListType()
      : null;
  });

/*
 * As in Notion: "- " at the start of a quote makes a list inside the quote,
 * the quote's words its first item. It turned the quote into a list.
 */
test("'- ' in an empty quote starts a list inside it", async () => {
  const live = await quoteWith("");
  await userEvent.keyboard("- A");
  await waitFor(() =>
    expect(shape(live)).toStrictEqual([
      { "quote-container": [{ list: ["listitem:A"] }] },
    ]),
  );
  await userEvent.keyboard("{Enter}B");
  await waitFor(() =>
    expect(shape(live)).toStrictEqual([
      { "quote-container": [{ list: ["listitem:A", "listitem:B"] }] },
    ]),
  );
});

test("'- ' at the start of a quote's words makes them a list item in it", async () => {
  const live = await quoteWith("Jot");
  await userEvent.keyboard("- ");
  await waitFor(() =>
    expect(shape(live)).toStrictEqual([
      { "quote-container": [{ list: ["listitem:Jot"] }] },
    ]),
  );
});

test("'1. ' in a quote starts a numbered list inside it", async () => {
  const live = await quoteWith("");
  await userEvent.keyboard("1. F");
  await waitFor(() =>
    expect(shape(live)).toStrictEqual([
      { "quote-container": [{ list: ["listitem:F"] }] },
    ]),
  );
  expect(listType(live)).toBe("number");
});

/*
 * Enter on the empty last item leaves the quote, still an item: Notion's
 * way out of a list in a quote.
 */
test("Enter on the empty last item takes it out of the quote, still an item", async () => {
  const live = await quoteWith("");
  await userEvent.keyboard("- C{Enter}D{Enter}{Enter}E");
  await waitFor(() =>
    expect(shape(live)).toStrictEqual([
      { "quote-container": [{ list: ["listitem:C", "listitem:D"] }] },
      { list: ["listitem:E"] },
    ]),
  );
});

/*
 * Lines of words in a quote stay in it, as in Notion: Backspace on an
 * empty item there takes its bullet, Enter goes on to a new line in the
 * quote, and Enter on an empty line too — only an empty item steps out.
 */
test("lines of words in a quote stay in it, empty or not", async () => {
  const live = await quoteWith("");
  await userEvent.keyboard("- C{Enter}{Backspace}T{Enter}U{Enter}{Enter}V");
  await waitFor(() => {
    const top = shape(live);
    expect(top).toHaveLength(1);
    expect(Object.keys(top[0] as object)).toStrictEqual(["quote-container"]);
    const words = live
      .getEditorState()
      .read(() => $getRoot().getTextContent().replaceAll("\n", " ").trim());
    expect(words.split(/\s+/)).toStrictEqual(["C", "T", "U", "V"]);
  });
});

/** Paste `html` on an empty line. */
async function paste(html: string) {
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
  live.update(() => $getRoot().clear().selectStart(), { discrete: true });
  const clipboardData = new DataTransfer();
  clipboardData.setData("text/html", html);
  clipboardData.setData("text/plain", "a");
  root.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );
  return live;
}

test("a pasted quote holding a list keeps the list inside it", async () => {
  const live = await paste(
    "<meta charset='utf-8'><blockquote><ul><li>a</li><li>b</li></ul></blockquote>",
  );
  await waitFor(() =>
    expect(shape(live)).toStrictEqual([
      { "quote-container": [{ list: ["listitem:a", "listitem:b"] }] },
    ]),
  );
});

test("a pasted quote of words stays a quote of words", async () => {
  const live = await paste(
    "<meta charset='utf-8'><blockquote><p>words</p></blockquote>",
  );
  await waitFor(() =>
    expect(
      live
        .getEditorState()
        .read(() => $getRoot().getChildren().map((node) => node.getType())),
    ).toStrictEqual(["quote"]),
  );
});

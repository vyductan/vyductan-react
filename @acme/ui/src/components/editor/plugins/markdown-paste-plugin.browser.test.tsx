import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";
import pastedShellNote from "./__fixtures__/pasted-shell-note.md?raw";

// Runs in the `browser` project against the shipped editor. The same paste
// passes under jsdom, which has no layout and no real clipboard — so the
// plugins that read either of those behave differently there.

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

const blockTexts = (editor: LexicalEditor) =>
  editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((child) => child.getTextContent()),
  );

/**
 * A whole document pasted into the middle of a note: headings, rules, a fenced
 * box-drawing block, bullets with inline code, and a blockquote ending in a
 * bare ">".
 */
test("pastes a markdown document at the caret without throwing", async () => {
  let editor: LexicalEditor | null = null;
  const failures: unknown[] = [];
  const onError = (event: ErrorEvent) => failures.push(event.error ?? event);
  globalThis.addEventListener("error", onError);

  render(
    <Editor autoFocus={false} resolvePasteLink={async () => null}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    for (const text of ["First block", "Last block"]) {
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(text));
      root.append(paragraph);
    }
    // The caret sits in the first block, far from the end.
    root.getFirstChild()?.selectEnd();
  });

  await waitFor(() => expect(blockTexts(live)).toHaveLength(2));

  // A real paste event, carrying a real DataTransfer, dispatched at the
  // contenteditable the way the browser does it.
  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  const clipboardData = new DataTransfer();
  clipboardData.setData("text/plain", pastedShellNote);

  contentEditable.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  await waitFor(() => {
    expect(blockTexts(live).length).toBeGreaterThan(5);
  });

  globalThis.removeEventListener("error", onError);

  expect(failures).toStrictEqual([]);
  expect(blockTexts(live).at(-1)).toBe("Last block");
});

/**
 * The caret is rarely in a bare paragraph. A note that has been written in
 * already has lists, and a list item is a different shape of block to insert
 * into.
 */
test("pastes a markdown document from inside a list item", async () => {
  let editor: LexicalEditor | null = null;
  const failures: unknown[] = [];
  const onError = (event: ErrorEvent) => failures.push(event.error ?? event);
  globalThis.addEventListener("error", onError);

  render(
    <Editor autoFocus={false} resolvePasteLink={async () => null}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    const list = $createListNode("number");
    const item = $createListItemNode();
    item.append($createTextNode("Phân biệt Vỏ và Ruột"));
    list.append(item);
    root.append(list);
    const tail = $createParagraphNode();
    tail.append($createTextNode("Last block"));
    root.append(tail);
    item.selectEnd();
  });

  const clipboardData = new DataTransfer();
  clipboardData.setData("text/plain", pastedShellNote);

  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  contentEditable.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  await waitFor(() => {
    expect(blockTexts(live).length).toBeGreaterThan(3);
  });

  globalThis.removeEventListener("error", onError);

  expect(failures).toStrictEqual([]);
  expect(blockTexts(live).at(-1)).toBe("Last block");
});

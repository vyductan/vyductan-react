import type { LexicalEditor } from "lexical";
import * as React from "react";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
  $isTextNode,
} from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";

// A real ClipboardEvent carrying a real DataTransfer, through the shipped
// editor, so its own copy handler and Lexical's paste both take part.

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

const WORDS = "Tại sao có cái này";

async function setUp() {
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
    root.append(
      $createListNode("bullet").append($createListItemNode()),
      $createListNode("number").append(
        $createListItemNode().append($createTextNode(`${WORDS}, tại sao?`)),
      ),
      $createParagraphNode().append($createTextNode("Last block")),
    );
  });

  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node?.textContent).toContain(WORDS);
    return node!;
  });
  contentEditable.focus();

  return { live, contentEditable };
}

function fire(target: HTMLElement, type: "copy" | "paste", data: DataTransfer) {
  target.dispatchEvent(
    new ClipboardEvent(type, {
      bubbles: true,
      cancelable: true,
      clipboardData: data,
    }),
  );
}

/** Each top-level block as [type, list type if any, text]. */
const shape = (editor: LexicalEditor) =>
  editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((block) => [
        block.getType(),
        $isListNode(block) ? block.getListType() : null,
        block.getTextContent(),
      ]),
  );

/**
 * Copying words from inside one numbered item and pasting them on a bullet
 * turned the bullet into "1.": the copy carried the numbered list around the
 * words, and the paste brought the list along. Notion brings only the words
 * when the copy came from inside a single block.
 */
test("pastes words copied from inside a numbered item without its list", async () => {
  const { live, contentEditable } = await setUp();

  live.update(() => {
    const numbered = $getRoot().getChildAtIndex(1);
    const item = $isListNode(numbered) ? numbered.getFirstChild() : null;
    const text = $isListItemNode(item) ? item.getFirstChild() : null;
    if ($isTextNode(text)) text.select(0, WORDS.length);
  });

  const clipboard = new DataTransfer();
  fire(contentEditable, "copy", clipboard);
  expect(clipboard.getData("text/plain")).toBe(WORDS);

  live.update(() => {
    const bullet = $getRoot().getFirstChild();
    const item = $isListNode(bullet) ? bullet.getFirstChild() : null;
    if ($isListItemNode(item)) item.select();
  });
  fire(contentEditable, "paste", clipboard);

  await waitFor(() =>
    expect(shape(live)).toStrictEqual([
      ["list", "bullet", WORDS],
      ["list", "number", `${WORDS}, tại sao?`],
      ["paragraph", null, "Last block"],
    ]),
  );
});

/** Copying across blocks is copying blocks: those still paste as blocks. */
test("still pastes blocks when the copy spans more than one", async () => {
  const { live, contentEditable } = await setUp();

  live.update(() => {
    const numbered = $getRoot().getChildAtIndex(1);
    const item = $isListNode(numbered) ? numbered.getFirstChild() : null;
    const from = $isListItemNode(item) ? item.getFirstChild() : null;
    const last = $getRoot().getLastChild();
    const to = $isElementNode(last) ? last.getFirstChild() : null;
    if ($isTextNode(from) && $isTextNode(to)) {
      const selection = from.select(0, 0);
      selection.focus.set(to.getKey(), 4, "text");
    }
  });

  const clipboard = new DataTransfer();
  fire(contentEditable, "copy", clipboard);

  live.update(() => {
    $getRoot().getLastChild()?.selectEnd();
  });
  fire(contentEditable, "paste", clipboard);

  await waitFor(() => {
    const types = shape(live).map(([type, listType]) => `${type}:${listType}`);
    // The numbered item came along as a numbered list.
    expect(
      types.filter((type) => type === "list:number").length,
    ).toBeGreaterThan(0);
    expect(shape(live).length).toBeGreaterThan(3);
  });
});

/**
 * The same, the way it is usually done: the words are a nested item ("a."),
 * and highlighting a whole line — a triple-click, or a drag to its end —
 * carries the selection to the very start of the next line. Nothing of that
 * next line is selected, so it is still a copy from inside one block.
 */
test("treats a whole-line selection ending at the next line's start as one block", async () => {
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
    const nested = $createListNode("number").append(
      $createListItemNode().append($createTextNode(WORDS)),
      $createListItemNode().append($createTextNode("Next line")),
    );
    root.append(
      $createListNode("bullet").append($createListItemNode()),
      $createListNode("number").append(
        $createListItemNode().append($createTextNode("Why")),
        $createListItemNode().append(nested),
      ),
    );
  });

  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node?.textContent).toContain("Next line");
    return node!;
  });
  contentEditable.focus();

  live.update(() => {
    const texts = $getRoot()
      .getAllTextNodes()
      .filter(
        (node) =>
          node.getTextContent() === WORDS ||
          node.getTextContent() === "Next line",
      );
    const [from, next] = texts;
    if (from && next) {
      const selection = from.select(0, 0);
      selection.focus.set(next.getKey(), 0, "text");
    }
  });

  const clipboard = new DataTransfer();
  fire(contentEditable, "copy", clipboard);

  live.update(() => {
    const bullet = $getRoot().getFirstChild();
    const item = $isListNode(bullet) ? bullet.getFirstChild() : null;
    if ($isListItemNode(item)) item.select();
  });
  fire(contentEditable, "paste", clipboard);

  await waitFor(() => {
    const [first] = shape(live);
    expect(first).toStrictEqual(["list", "bullet", WORDS]);
  });
});

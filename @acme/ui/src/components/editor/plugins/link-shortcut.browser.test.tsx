import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isTextNode,
} from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Runs in the `browser` project: `userEvent` is Playwright-backed, so ⌘K is
// a real key press that goes through Lexical's own keydown routing before it
// bubbles to `window`, where an app-level command palette listens.

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

// Meta on macOS; Ctrl+K elsewhere (on macOS Ctrl+K is the native kill-line).
const modifier = navigator.platform.startsWith("Mac") ? "Meta" : "Control";

async function renderSimpleEditor() {
  let editor: LexicalEditor | null = null;

  // `simple` is the variant that mounts the fixed toolbar, and with it the
  // link plugin that owns ⌘K.
  render(
    <Editor variant="simple" autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    root.append($createParagraphNode().append($createTextNode("hello world")));
  });

  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node?.textContent).toBe("hello world");
    return node!;
  });
  await userEvent.click(contentEditable);

  return live;
}

function select(editor: LexicalEditor, anchor: number, focus: number) {
  editor.update(() => {
    const text = $getRoot().getFirstDescendant();
    if ($isTextNode(text)) text.select(anchor, focus);
  });
}

const hasLink = (editor: LexicalEditor) =>
  editor
    .getEditorState()
    .read(() => $getRoot().getAllTextNodes().some((n) => $isLinkNode(n.getParent())));

/** Presses ⌘K and reports whether the key reached `window` unclaimed. */
async function pressModK(): Promise<{ reachedWindow: boolean }> {
  let reachedWindow = false;
  const listener = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === "k") reachedWindow = !event.defaultPrevented;
  };
  globalThis.addEventListener("keydown", listener);
  try {
    await userEvent.keyboard(`{${modifier}>}k{/${modifier}}`);
  } finally {
    globalThis.removeEventListener("keydown", listener);
  }
  return { reachedWindow };
}

test("⌘K on selected text links it and keeps the key from the page", async () => {
  const editor = await renderSimpleEditor();
  select(editor, 0, 5);

  const { reachedWindow } = await pressModK();

  await waitFor(() => expect(hasLink(editor)).toBe(true));
  expect(reachedWindow).toBe(false);
});

/**
 * The link plugin used to take ⌘K on any caret, so inside the editor the
 * command palette could never open — it only saw a prevented event.
 */
test("⌘K with nothing selected leaves the key to the page", async () => {
  const editor = await renderSimpleEditor();
  select(editor, 3, 3);

  const { reachedWindow } = await pressModK();

  expect(reachedWindow).toBe(true);
  expect(hasLink(editor)).toBe(false);
});

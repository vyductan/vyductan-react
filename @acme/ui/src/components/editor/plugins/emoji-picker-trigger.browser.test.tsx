import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Real typing: the menu reacts to text as it is entered.

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

/** Puts the caret at the end of a paragraph built from `runs`, bold ones marked. */
async function typeAfter(runs: Array<[string, boolean]>) {
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
  live.update(() => {
    const paragraph = $createParagraphNode();
    for (const [text, bold] of runs) {
      const node = $createTextNode(text);
      if (bold) node.toggleFormat("bold");
      paragraph.append(node);
    }
    $getRoot().clear().append(paragraph);
    paragraph.selectEnd();
  });
}

/** Whether the emoji menu is open, offering "smile". */
const emojiMenuOpen = () =>
  [...document.querySelectorAll("li, [role='option']")].some(
    (node) =>
      node.textContent?.includes("smile") &&
      !node.closest('[contenteditable="true"]'),
  );

const settle = () => new Promise((resolve) => setTimeout(resolve, 150));

/**
 * "lãnh đạo:" — a colon ending a word. The word was bold and the colon not,
 * so the colon began a text node of its own, and the menu read that as the
 * start of the line and opened.
 */
test("does not open on a colon that ends a word, even after bold text", async () => {
  await typeAfter([["lãnh đạo", true]]);
  await userEvent.keyboard(":sm");
  await settle();
  expect(emojiMenuOpen()).toBe(false);
});

test("does not open on a colon alone", async () => {
  await typeAfter([["Why ", false]]);
  await userEvent.keyboard(":");
  await settle();
  expect(emojiMenuOpen()).toBe(false);
});

/** As in Notion: a colon after a space, then two letters of the name. */
test("opens once two letters follow a colon after a space", async () => {
  await typeAfter([["Why ", false]]);
  await userEvent.keyboard(":sm");
  await waitFor(() => expect(emojiMenuOpen()).toBe(true));
});

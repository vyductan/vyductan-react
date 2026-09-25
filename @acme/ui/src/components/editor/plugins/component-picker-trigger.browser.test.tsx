import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Runs in the `browser` project: the slash menu opens from the text before a
// real caret, so "/" has to be a real key press.

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

async function renderEditor() {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  await userEvent.click(
    await waitFor(() => {
      const node = document.querySelector<HTMLElement>(
        '[contenteditable="true"]',
      );
      expect(node).not.toBeNull();
      return node!;
    }),
  );
}

/** The slash menu lists block types; "Numbered list" is always among them. */
const menuIsOpen = () =>
  [...document.querySelectorAll('[role="option"]')].some((option) =>
    option.textContent?.includes("Numbered list"),
  );

test("'/' at the start of an empty line opens the menu", async () => {
  await renderEditor();

  await userEvent.keyboard("/");

  await waitFor(() => expect(menuIsOpen()).toBe(true));
});

test("'/' in the middle of a line does not open the menu", async () => {
  await renderEditor();

  await userEvent.keyboard("abc 123 /");
  await new Promise((resolve) => setTimeout(resolve, 400));

  expect(menuIsOpen()).toBe(false);
});

test("'/' after text in an earlier, differently formatted run does not open it", async () => {
  await renderEditor();

  // Bold then plain splits the line into two text nodes; the "/" lands at the
  // start of the second one, which is not the start of the line.
  const modifier = navigator.platform.startsWith("Mac") ? "Meta" : "Control";
  await userEvent.keyboard(
    `{${modifier}>}b{/${modifier}}bold{${modifier}>}b{/${modifier}}/`,
  );
  await new Promise((resolve) => setTimeout(resolve, 400));

  expect(menuIsOpen()).toBe(false);
});

test("'/' at the start of a soft line break opens the menu", async () => {
  await renderEditor();

  await userEvent.keyboard("first line{Shift>}{Enter}{/Shift}/");

  await waitFor(() => expect(menuIsOpen()).toBe(true));
});

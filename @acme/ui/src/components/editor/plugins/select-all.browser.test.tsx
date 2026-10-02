import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Runs in the `browser` project: Cmd+A has to be a real key press for the
// browser's own handling to be in play.

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

const modifier = navigator.platform.startsWith("Mac") ? "Meta" : "Control";
const selectAll = () => userEvent.keyboard(`{${modifier}>}a{/${modifier}}`);
const selected = () => globalThis.getSelection()?.toString() ?? "";

/**
 * Like Notion: Cmd+A first selects the line the caret is on, and only a
 * second Cmd+A selects the whole page.
 */
test("Cmd+A selects the line first, then the whole page", async () => {
  await renderEditor();
  await userEvent.keyboard("first line{Enter}second line");

  await selectAll();
  await waitFor(() => expect(selected()).toBe("second line"));

  await selectAll();
  await waitFor(() => {
    expect(selected()).toContain("first line");
    expect(selected()).toContain("second line");
  });
});

test("Cmd+A on an empty line selects the whole page at once", async () => {
  await renderEditor();
  await userEvent.keyboard("first line{Enter}");

  await selectAll();
  await waitFor(() => expect(selected()).toContain("first line"));
});

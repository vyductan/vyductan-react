import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Runs in the `browser` project: the conflict is between Lexical's keydown
// handling and an app-level listener on `window` (the sidebar's ⌘B toggle),
// so the key has to travel the real path from the editor up to `window`.

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

const modifier = navigator.platform.startsWith("Mac") ? "Meta" : "Control";

/** Counts the ⌘/Ctrl+<key> presses that reach `window`, like the sidebar. */
function listenOnWindow(key: string) {
  let count = 0;
  const listener = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === key && (event.metaKey || event.ctrlKey)) {
      count += 1;
    }
  };
  globalThis.addEventListener("keydown", listener);
  return {
    get count() {
      return count;
    },
    stop: () => globalThis.removeEventListener("keydown", listener),
  };
}

async function renderEditor() {
  let editor: LexicalEditor | null = null;

  render(
    <div>
      <button type="button">outside</button>
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
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

  return editor as unknown as LexicalEditor;
}

test.each(["b", "i", "u"])(
  "⌘%s inside the editor formats text and does not reach the page",
  async (key) => {
    const editor = await renderEditor();
    const onWindow = listenOnWindow(key);

    try {
      await userEvent.keyboard(`{${modifier}>}${key}{/${modifier}}word`);
    } finally {
      onWindow.stop();
    }

    const format = { b: "bold", i: "italic", u: "underline" }[key] as
      "bold" | "italic" | "underline";
    await waitFor(() =>
      expect(
        editor
          .getEditorState()
          .read(() => $getRoot().getAllTextNodes()[0]?.hasFormat(format)),
      ).toBe(true),
    );
    expect(onWindow.count).toBe(0);
  },
);

test("⌘B outside the editor still reaches the page", async () => {
  await renderEditor();
  const onWindow = listenOnWindow("b");

  try {
    await userEvent.click(document.querySelector("button")!);
    await userEvent.keyboard(`{${modifier}>}b{/${modifier}}`);
  } finally {
    onWindow.stop();
  }

  expect(onWindow.count).toBe(1);
});

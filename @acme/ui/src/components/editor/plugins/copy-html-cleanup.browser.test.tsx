import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";
import { MARKDOWN_DOCUMENT_TRANSFORMERS } from "../transformers/markdown-transformers";

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

/**
 * As reported: a spec's header quote, copied from VD Markdown into Notion,
 * came out as a code block per inline code, the text between them gone.
 */
test("a copy from the editor puts plain semantic HTML on the clipboard", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const root = document.querySelector<HTMLElement>('[contenteditable="true"]')!;
  root.focus();
  (editor as unknown as LexicalEditor).update(
    () => {
      $convertFromMarkdownString(
        "> **Phạm vi áp dụng:** GTMS (buffer `direct_web`, ledger `booking`)",
        MARKDOWN_DOCUMENT_TRANSFORMERS,
      );
      $getRoot().select(0, $getRoot().getChildrenSize());
    },
    { discrete: true },
  );

  const clipboardData = new DataTransfer();
  root.dispatchEvent(
    new ClipboardEvent("copy", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  const html = clipboardData.getData("text/html");
  expect(html).toContain("<code>direct_web</code>");
  expect(html).toContain("<code>booking</code>");
  expect(html).not.toContain("white-space");
  expect(html).not.toContain("class=");
  // The editor's own copy is untouched: pasted back, it is the same.
  expect(clipboardData.types).toContain("application/x-lexical-editor");
});

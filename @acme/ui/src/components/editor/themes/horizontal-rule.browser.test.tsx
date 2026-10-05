import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
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
 * A `---` showed nothing: the rule was drawn by the <hr>'s ::after with its
 * border turned off, and Chrome makes no ::after for an <hr> — a void
 * element. Its box was 0px high. Notion, given the same <hr>, drew the line.
 */
test("a horizontal rule shows a line", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  (editor as unknown as LexicalEditor).update(
    () => {
      $convertFromMarkdownString(
        "> quote\n\n---\n\n## Next",
        MARKDOWN_DOCUMENT_TRANSFORMERS,
      );
    },
    { discrete: true },
  );

  const hr = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"] hr',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  const style = getComputedStyle(hr);
  expect(hr.getBoundingClientRect().height).toBeGreaterThanOrEqual(1);
  expect(style.borderTopStyle).toBe("solid");
});

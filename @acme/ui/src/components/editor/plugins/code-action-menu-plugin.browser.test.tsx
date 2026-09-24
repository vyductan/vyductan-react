import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $createCodeNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import { userEvent } from "vitest/browser";
import { $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";

// The menu follows the pointer across code blocks, so it needs a real pointer
// and real layout — neither of which jsdom has.

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

test("shows the code block's actions on hover", async () => {
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
    const code = $createCodeNode("javascript");
    code.append($createTextNode("const x = 1;\nconst y = 2;"));
    root.append(code);
  });

  const codeBlock = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"] code',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  await userEvent.hover(codeBlock);

  await waitFor(() => {
    const menu = document.querySelector<HTMLElement>(
      ".code-action-menu-container",
    );
    expect(menu).not.toBeNull();
    // Notion shows the language and a way to copy; so does this.
    expect(menu?.textContent).toContain("JavaScript");
    expect(
      menu?.querySelector('[title="Select language"]'),
    ).not.toBeNull();
    expect(menu?.querySelectorAll("button").length).toBeGreaterThan(1);
  });
});

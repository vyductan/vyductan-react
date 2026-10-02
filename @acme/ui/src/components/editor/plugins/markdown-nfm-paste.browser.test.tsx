import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";

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

async function pasteIntoEmptyEditor(flavours: Record<string, string>) {
  let editor: LexicalEditor | null = null;

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
    const paragraph = $createParagraphNode();
    root.append(paragraph);
    paragraph.select();
  });

  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  const clipboardData = new DataTransfer();
  for (const [type, value] of Object.entries(flavours)) {
    clipboardData.setData(type, value);
  }

  contentEditable.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  return contentEditable;
}

/**
 * Notion-flavored Markdown, as Notion's markdown API and its own copy write
 * toggles and callouts. Pasted, they become a toggle and a callout — not tag
 * soup.
 */
test("pastes a Notion toggle as a toggle", async () => {
  const contentEditable = await pasteIntoEmptyEditor({
    "text/plain": "<details><summary>More</summary>\n\tHidden body\n</details>",
  });

  await waitFor(() => {
    // A <div> on Chrome, a <details> elsewhere: see collapsible-container-node.
    const details = contentEditable.querySelector(".Collapsible__container");
    expect(details?.querySelector(".Collapsible__title")?.textContent).toBe(
      "More",
    );
    expect(details?.textContent).toContain("Hidden body");
  });
  expect(contentEditable.textContent).not.toContain("<details>");
  expect(contentEditable.textContent).not.toContain("<summary>");
});

test("pastes a Notion callout as a callout with its icon and color", async () => {
  const contentEditable = await pasteIntoEmptyEditor({
    "text/plain": '<callout icon="💡" color="blue_bg">\n\tA tip\n</callout>',
  });

  const callout = await waitFor(() => {
    const node = contentEditable.querySelector<HTMLElement>(".Callout");
    expect(node).not.toBeNull();
    return node!;
  });
  expect(callout.textContent).toBe("A tip");
  expect(callout.dataset.color).toBe("blue_bg");
  expect(getComputedStyle(callout, "::before").content).toContain("💡");
  expect(getComputedStyle(callout).backgroundColor).not.toBe(
    "rgba(0, 0, 0, 0)",
  );
});

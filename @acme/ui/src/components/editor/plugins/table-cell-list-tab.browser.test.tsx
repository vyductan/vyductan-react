import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $isListItemNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";
import { markdownToLexicalContent } from "../utils/lexical-converter";

// Runs in the `browser` project: Tab has to be a real key press for the
// table's own Tab handling to see it.

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

async function tableWithList() {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.setEditorState(
    live.parseEditorState(
      JSON.stringify(
        markdownToLexicalContent(
          "| A | Resolution |\n| --- | --- |\n| x | base url<br>• Lợi ích |",
        ),
      ),
    ),
  );
  const cell = await waitFor(() => {
    const node = [...document.querySelectorAll<HTMLElement>("td")].find((td) =>
      td.textContent?.includes("Lợi ích"),
    );
    expect(node).toBeDefined();
    return node!;
  });
  await userEvent.click(cell);
  live.update(
    () => {
      const text = $getRoot()
        .getAllTextNodes()
        .find((node) => node.getTextContent() === "Lợi ích")!;
      text.select(text.getTextContentSize(), text.getTextContentSize());
    },
    { discrete: true },
  );
  return live;
}

/** The caret's list item: its text and depth; null when not in a list. */
const caretItem = (live: LexicalEditor) =>
  live.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return null;
    const node = selection.anchor.getNode();
    const item = $isListItemNode(node) ? node : node.getParent();
    return $isListItemNode(item)
      ? `${item.getTextContent()}@${item.getIndent()}`
      : null;
  });

/**
 * As in Notion: in a list in a table cell, Tab nests the item and Shift+Tab
 * takes it back out. It went to the next cell, as Tab does in a cell's text.
 */
test("Tab in a list in a table cell nests the item", async () => {
  const live = await tableWithList();

  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard("{Tab}");
  await userEvent.keyboard("d");

  await waitFor(() => expect(caretItem(live)).toBe("d@1"));

  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  await waitFor(() => expect(caretItem(live)).toBe("d@0"));
});

test("Tab in a cell's text still goes to the next cell", async () => {
  const live = await tableWithList();
  live.update(
    () => {
      const text = $getRoot()
        .getAllTextNodes()
        .find((node) => node.getTextContent() === "x")!;
      text.select(1, 1);
    },
    { discrete: true },
  );

  await userEvent.keyboard("{Tab}");

  await waitFor(() =>
    expect(
      live.getEditorState().read(() => {
        const selection = $getSelection();
        return $isRangeSelection(selection)
          ? selection.anchor.getNode().getTextContent()
          : null;
      }),
    ).not.toBe("x"),
  );
});

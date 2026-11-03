import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTableSelectionFrom,
  $getTableCellNodeFromLexicalNode,
  $isTableNode,
} from "@lexical/table";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $getRoot, $setSelection } from "lexical";
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

const TABLE_WITH_LIST =
  "| Knowledge | Email |\n| --- | --- |\n| x | • Email confirmed<br>• Leader change |";

async function copied(select: (editor: LexicalEditor) => void) {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  const root = document.querySelector<HTMLElement>('[contenteditable="true"]')!;
  root.focus();
  live.update(
    () =>
      $convertFromMarkdownString(
        TABLE_WITH_LIST,
        MARKDOWN_DOCUMENT_TRANSFORMERS,
      ),
    { discrete: true },
  );
  await waitFor(() => expect(document.querySelector("td li")).not.toBeNull());
  live.update(() => select(live), { discrete: true });

  const clipboardData = new DataTransfer();
  root.dispatchEvent(
    new ClipboardEvent("copy", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );
  return clipboardData.getData("text/html");
}

/**
 * A list in a table cell goes to Notion as Notion keeps one in a cell: lines
 * of "  • " text. It went as a <ul>, which Notion pasted as plain "• " text.
 */
test("a table copied whole sends its cell lists as Notion's lines", async () => {
  const html = await copied(() =>
    $getRoot().select(0, $getRoot().getChildrenSize()),
  );

  expect(html).toContain("<p>  • Email confirmed</p>");
  expect(html).not.toContain("<ul");
});

test("a table copied by its cells sends its cell lists as Notion's lines", async () => {
  const html = await copied(() => {
    const table = $getRoot().getChildren().find($isTableNode)!;
    const cells = table.getAllTextNodes();
    const first = $getTableCellNodeFromLexicalNode(cells[0]!)!;
    const last = $getTableCellNodeFromLexicalNode(cells.at(-1)!)!;
    $setSelection($createTableSelectionFrom(table, first, last));
  });

  expect(html).toContain("<p>  • Email confirmed</p>");
  expect(html).not.toContain("<ul");
});

/**
 * Cells selected, the page has no selection of its own, and the copy VS Code
 * sends is aimed at <body>, outside the editor. @lexical/table fills it from
 * a listener on the document; the cleanup, which only took copies aimed
 * inside the editor, left that HTML as it was — class soup and a <ul> per
 * cell list, which Notion pasted as plain "• " text.
 */
test("cells copied by a copy aimed outside the editor are cleaned too", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  const root = document.querySelector<HTMLElement>('[contenteditable="true"]')!;
  root.focus();
  live.update(
    () =>
      $convertFromMarkdownString(
        TABLE_WITH_LIST,
        MARKDOWN_DOCUMENT_TRANSFORMERS,
      ),
    { discrete: true },
  );
  await waitFor(() => expect(document.querySelector("td li")).not.toBeNull());
  live.update(
    () => {
      const table = $getRoot().getChildren().find($isTableNode)!;
      const cells = table.getAllTextNodes();
      $setSelection(
        $createTableSelectionFrom(
          table,
          $getTableCellNodeFromLexicalNode(cells[0]!)!,
          $getTableCellNodeFromLexicalNode(cells.at(-1)!)!,
        ),
      );
    },
    { discrete: true },
  );

  const clipboardData = new DataTransfer();
  document.body.dispatchEvent(
    new ClipboardEvent("copy", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  const html = clipboardData.getData("text/html");
  expect(html).toContain("<table");
  expect(html).toContain("<p>  • Email confirmed</p>");
  expect(html).not.toContain("class=");
});

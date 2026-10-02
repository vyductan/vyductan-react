import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

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

afterEach(() => {
  // Unmount first: the picker is portaled to <body>, and emptying <body>
  // under a mounted portal makes React's own removal throw.
  cleanup();
  document.body.replaceChildren();
});

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

  return { contentEditable, live };
}

/**
 * Notion markup the editor does not model comes in as read-only chips: a
 * mention shows as @name inside its line, a child page as its title. A chip
 * is selected by clicking it and removed with Backspace.
 */
const NFM =
  'Intro <mention-user url="user://1">Tân</mention-user> here\n\n<page url="https://www.notion.so/abc">Child page</page>';

test("pasted Notion markup shows as chips", async () => {
  const { contentEditable } = await pasteIntoEmptyEditor({ "text/plain": NFM });

  const block = await waitFor(() => {
    const node = contentEditable.querySelector<HTMLElement>(".NfmRaw--block");
    expect(node).not.toBeNull();
    return node!;
  });
  expect(block.textContent).toContain("Child page");
  expect(contentEditable.querySelector(".NfmRaw--inline")?.textContent).toBe(
    "@Tân",
  );
  expect(contentEditable.textContent).not.toContain("<page");
  expect(contentEditable.textContent).not.toContain("<mention-user");
});

test("a chip is selected by a click and removed with Backspace", async () => {
  const { contentEditable } = await pasteIntoEmptyEditor({ "text/plain": NFM });

  const block = await waitFor(() => {
    const node = contentEditable.querySelector<HTMLElement>(".NfmRaw--block");
    expect(node).not.toBeNull();
    return node!;
  });
  await userEvent.click(block);
  await waitFor(() => expect(block.dataset.selected).toBe("true"));

  await userEvent.keyboard("{Backspace}");
  await waitFor(() =>
    expect(contentEditable.querySelector(".NfmRaw--block")).toBeNull(),
  );
  expect(contentEditable.querySelector(".NfmRaw--inline")).not.toBeNull();
});

/**
 * A plain Notion table — rows and cells, no colors — is not a chip: it comes
 * in as a real table, header row and all.
 */
test("a pasted plain Notion table is a real table, not a chip", async () => {
  const { contentEditable } = await pasteIntoEmptyEditor({
    "text/plain":
      '<table header-row="true">\n\t<tr>\n\t\t<td>Name</td>\n\t\t<td>Role</td>\n\t</tr>\n\t<tr>\n\t\t<td>Tân</td>\n\t\t<td>Owner</td>\n\t</tr>\n</table>',
  });

  const table = await waitFor(() => {
    const node = contentEditable.querySelector("table");
    expect(node).not.toBeNull();
    return node!;
  });
  expect(contentEditable.querySelector(".NfmRaw--block")).toBeNull();
  expect(
    [...table.querySelectorAll("tr")].map((row) =>
      [...row.querySelectorAll("th, td")].map((cell) => cell.textContent),
    ),
  ).toStrictEqual([
    ["Name", "Role"],
    ["Tân", "Owner"],
  ]);
  expect(table.querySelector("tr")?.querySelector("th")).not.toBeNull();
});

import type { LexicalEditor } from "lexical";
import * as React from "react";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createTextNode, $getRoot, $isTextNode } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";
import { EditorRender } from "../editor-render";

// Runs in the `browser` project: Backspace has to be a real key press so it
// goes through Lexical's own delete handling first.

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

const item = (text: string) =>
  $createListItemNode().append($createTextNode(text));

async function renderList(type: "number" | "bullet" = "number") {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.update(
    () => {
      $getRoot()
        .clear()
        .append(
          $createListNode(type).append(item("aa"), item("bb"), item("cc")),
        );
    },
    { discrete: true },
  );
  await waitFor(() =>
    expect(
      document.querySelectorAll('[contenteditable="true"] li'),
    ).toHaveLength(3),
  );
  return live;
}

/** Put the caret at `offset` in the text of the item reading `text`. */
async function caretIn(editor: LexicalEditor, text: string, offset: number) {
  await userEvent.click(
    document.querySelector<HTMLElement>('[contenteditable="true"]')!,
  );
  editor.update(() => {
    const node = $getRoot()
      .getAllTextNodes()
      .find((candidate) => candidate.getTextContent() === text);
    if ($isTextNode(node)) node.select(offset, offset);
  });
}

const items = () => [
  ...document.querySelectorAll<HTMLLIElement>('[contenteditable="true"] li'),
];

/** What each item shows: its number (or bullet) and text; "" when unmarked. */
const markers = () =>
  items().map((li) => ({
    text: li.textContent,
    marker:
      getComputedStyle(li).listStyleType === "none" ? "" : String(li.value),
  }));

test("Backspace at the start of an item drops its marker but keeps it in the list", async () => {
  const editor = await renderList();
  await caretIn(editor, "bb", 0);

  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(markers()).toEqual([
      { text: "aa", marker: "1" },
      { text: "bb", marker: "" },
      // The unmarked line is a continuation of "aa": it takes no number.
      { text: "cc", marker: "2" },
    ]),
  );
  expect(
    editor.getEditorState().read(() =>
      $getRoot()
        .getAllTextNodes()
        .map((node) => [
          node.getTextContent(),
          $isListItemNode(node.getParent()),
        ]),
    ),
  ).toEqual([
    ["aa", true],
    ["bb", true],
    ["cc", true],
  ]);
});

test("Backspace in the middle of an item still deletes a character", async () => {
  const editor = await renderList();
  await caretIn(editor, "bb", 1);

  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(markers()).toEqual([
      { text: "aa", marker: "1" },
      { text: "b", marker: "2" },
      { text: "cc", marker: "3" },
    ]),
  );
});

test("Backspace again on an unmarked line takes it out of the list", async () => {
  const editor = await renderList();
  await caretIn(editor, "bb", 0);
  await userEvent.keyboard("{Backspace}");
  await waitFor(() => expect(markers()[1]?.marker).toBe(""));

  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(
      editor.getEditorState().read(() =>
        $getRoot()
          .getAllTextNodes()
          .find((node) => node.getTextContent().includes("bb"))
          ?.getParent()
          ?.getType(),
      ),
    ).not.toBe("listitem"),
  );
});

test("the published view hides the marker and numbers the same way", async () => {
  const editor = await renderList();
  await caretIn(editor, "bb", 0);
  await userEvent.keyboard("{Backspace}");
  await waitFor(() => expect(markers()[1]?.marker).toBe(""));

  const json = JSON.stringify(editor.getEditorState().toJSON());
  cleanup();
  const { container } = render(<EditorRender value={json} />);
  const published = [...container.querySelectorAll<HTMLLIElement>("li")].map(
    (li) => ({
      text: li.textContent,
      marker:
        getComputedStyle(li).listStyleType === "none" ? "" : String(li.value),
    }),
  );

  expect(published).toEqual([
    { text: "aa", marker: "1" },
    { text: "bb", marker: "" },
    { text: "cc", marker: "2" },
  ]);
});

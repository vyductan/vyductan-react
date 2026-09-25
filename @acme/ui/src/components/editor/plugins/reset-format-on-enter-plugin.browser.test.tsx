import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Runs in the `browser` project: Enter and ⌘B have to be real key presses so
// Lexical's own keydown routing decides what a new paragraph inherits.

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

async function renderEditor() {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const editable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  await userEvent.click(editable);

  return editor as unknown as LexicalEditor;
}

/** Each text node's content with whether it is bold / italic and its style. */
function textRuns(editor: LexicalEditor) {
  return editor.getEditorState().read(() =>
    $getRoot()
      .getAllTextNodes()
      .map((node) => ({
        text: node.getTextContent(),
        bold: node.hasFormat("bold"),
        italic: node.hasFormat("italic"),
        style: node.getStyle(),
      })),
  );
}

test("a new line after bold text starts plain", async () => {
  const editor = await renderEditor();

  await userEvent.keyboard(`{${modifier}>}b{/${modifier}}Bold{Enter}plain`);

  await waitFor(() =>
    expect(textRuns(editor)).toEqual([
      { text: "Bold", bold: true, italic: false, style: "" },
      { text: "plain", bold: false, italic: false, style: "" },
    ]),
  );
});

test("italic is cleared as well", async () => {
  const editor = await renderEditor();

  await userEvent.keyboard(
    `{${modifier}>}b{/${modifier}}{${modifier}>}i{/${modifier}}Both{Enter}plain`,
  );

  await waitFor(() =>
    expect(textRuns(editor).at(-1)).toEqual({
      text: "plain",
      bold: false,
      italic: false,
      style: "",
    }),
  );
});

test("a coloured line does not colour the next one", async () => {
  const editor = await renderEditor();

  editor.update(() => {
    const text = $createTextNode("Red").setStyle("color: rgb(255, 0, 0)");
    const root = $getRoot();
    root.clear();
    root.append($createParagraphNode().append(text));
    text.selectEnd();
  });
  await userEvent.keyboard("{Enter}plain");

  await waitFor(() =>
    expect(textRuns(editor).at(-1)).toEqual({
      text: "plain",
      bold: false,
      italic: false,
      style: "",
    }),
  );
});

test("a new list item after a bold one starts plain", async () => {
  const editor = await renderEditor();

  editor.update(() => {
    const text = $createTextNode("Item").toggleFormat("bold");
    const root = $getRoot();
    root.clear();
    root.append(
      $createListNode("bullet").append($createListItemNode().append(text)),
    );
    text.selectEnd();
  });
  await userEvent.keyboard("{Enter}next");

  await waitFor(() =>
    expect(textRuns(editor)).toEqual([
      { text: "Item", bold: true, italic: false, style: "" },
      { text: "next", bold: false, italic: false, style: "" },
    ]),
  );
});

test("splitting a bold word keeps the moved half bold", async () => {
  const editor = await renderEditor();

  editor.update(() => {
    const text = $createTextNode("Bold").toggleFormat("bold");
    const root = $getRoot();
    root.clear();
    root.append($createParagraphNode().append(text));
    text.select(2, 2);
  });
  await userEvent.keyboard("{Enter}");

  await waitFor(() =>
    expect(textRuns(editor)).toEqual([
      { text: "Bo", bold: true, italic: false, style: "" },
      { text: "ld", bold: true, italic: false, style: "" },
    ]),
  );
});

test("one undo takes back the Enter, format reset included", async () => {
  const editor = await renderEditor();

  await userEvent.keyboard(`{${modifier}>}b{/${modifier}}Bold`);
  // Past the history plugin's merge window, so Enter is its own undo step.
  await new Promise((resolve) => setTimeout(resolve, 1100));
  await userEvent.keyboard("{Enter}");
  await new Promise((resolve) => setTimeout(resolve, 100));
  await userEvent.keyboard(`{${modifier}>}z{/${modifier}}`);

  await waitFor(() =>
    expect(
      editor.getEditorState().read(() => $getRoot().getChildrenSize()),
    ).toBe(1),
  );
  expect(textRuns(editor)).toEqual([
    { text: "Bold", bold: true, italic: false, style: "" },
  ]);
});

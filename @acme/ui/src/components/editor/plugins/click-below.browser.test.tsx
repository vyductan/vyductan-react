import type { LexicalEditor, LexicalNode } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
} from "lexical";
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

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

async function setup(build: () => LexicalNode[]) {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  const root = document.querySelector<HTMLElement>('[contenteditable="true"]')!;
  // Room below the last block, as a page gives it.
  root.style.paddingBottom = "200px";
  live.update(() => $getRoot().clear().append(...build()), { discrete: true });
  return { live, root };
}

function mouseDown(root: HTMLElement, clientY: number) {
  const box = root.getBoundingClientRect();
  root.dispatchEvent(
    new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientX: box.left + box.width / 2,
      clientY,
    }),
  );
}

const blocks = (live: LexicalEditor) =>
  live
    .getEditorState()
    .read(() =>
      $getRoot()
        .getChildren()
        .map((node) => `${node.getType()}:${node.getTextContent()}`),
    );

const caretBlock = (live: LexicalEditor) =>
  live.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return null;
    const node = selection.anchor.getNode();
    const top = node.getTopLevelElement() ?? node;
    return $getRoot().getChildren().indexOf(top);
  });

const paragraph = (text: string) =>
  $createParagraphNode().append($createTextNode(text));

test("a click below the last block adds a line there and puts the caret on it", async () => {
  const { live, root } = await setup(() => [
    paragraph("Một"),
    $createListNode("bullet").append(
      $createListItemNode().append($createTextNode("Hai")),
    ),
  ]);
  mouseDown(root, root.getBoundingClientRect().bottom - 40);
  await waitFor(() =>
    expect(blocks(live)).toStrictEqual(["paragraph:Một", "list:Hai", "paragraph:"]),
  );
  expect(caretBlock(live)).toBe(2);
});

test("below an empty last line, the click goes to it — no second one", async () => {
  const { live, root } = await setup(() => [
    paragraph("Một"),
    $createParagraphNode(),
  ]);
  mouseDown(root, root.getBoundingClientRect().bottom - 40);
  await waitFor(() => expect(caretBlock(live)).toBe(1));
  expect(blocks(live)).toStrictEqual(["paragraph:Một", "paragraph:"]);
});

test("a click on the editable above the last block's foot adds nothing", async () => {
  const { live, root } = await setup(() => [paragraph("Một"), paragraph("Hai")]);
  mouseDown(root, root.getBoundingClientRect().top + 2);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(blocks(live)).toStrictEqual(["paragraph:Một", "paragraph:Hai"]);
});

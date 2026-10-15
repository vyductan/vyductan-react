import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode } from "@lexical/rich-text";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
} from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";
import {
  $createCheckBlockNode,
  $isCheckBlockNode,
} from "../nodes/check-block-node";

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

const blocks = (live: LexicalEditor) =>
  live.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((node) => ({
        type: $isCheckBlockNode(node) ? "todo" : node.getType(),
        text: node.getTextContent(),
        indent: $isElementNode(node) ? node.getIndent() : 0,
        checked: $isCheckBlockNode(node) ? node.getChecked() : undefined,
      })),
  );

/**
 * Cmd+C with the caret on a to-do (nothing selected) copies the line —
 * pasted, it came out as plain text, without its checkbox: the clipboard's
 * HTML lost the class the to-do is read back by.
 */
test("a to-do copied by its line pastes back as a to-do", async () => {
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
    () => {
      const todo = $createCheckBlockNode(true).append(
        $createTextNode("Create MR"),
      );
      $getRoot().clear().append(todo, $createParagraphNode());
      todo.getFirstDescendant()?.selectEnd();
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
  live.update(() => $getRoot().getLastChildOrThrow().selectStart(), {
    discrete: true,
  });
  root.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  await waitFor(() =>
    expect(
      blocks(live).filter((block) => block.text === "Create MR"),
    ).toStrictEqual([
      { type: "todo", text: "Create MR", indent: 0, checked: true },
      { type: "todo", text: "Create MR", indent: 0, checked: true },
    ]),
  );
});

/** The same for a heading: copied by its line, it pastes back a heading. */
test("a heading copied by its line pastes back as a heading", async () => {
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
    () => {
      const heading = $createHeadingNode("h2").append($createTextNode("Plan"));
      $getRoot().clear().append(heading, $createParagraphNode());
      heading.selectEnd();
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
  live.update(() => $getRoot().getLastChildOrThrow().selectStart(), {
    discrete: true,
  });
  root.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  await waitFor(() =>
    expect(
      blocks(live)
        .filter((block) => block.text === "Plan")
        .map((block) => block.type),
    ).toStrictEqual(["heading", "heading"]),
  );
});

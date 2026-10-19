import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode } from "@lexical/rich-text";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
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

/**
 * Pasting a plain line onto an empty to-do — Enter, then Cmd+V — lost the
 * checkbox: the copied paragraph took the to-do's place. In Notion a plain
 * line pasted into a block joins it; the to-do stays a to-do.
 */
for (const how of ["by its line", "by all of its text"] as const) {
  test(`a plain line copied ${how} pastes into an empty to-do as its text`, async () => {
    let editor: LexicalEditor | null = null;
    render(
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>,
    );
    await waitFor(() => expect(editor).not.toBeNull());
    const live = editor as unknown as LexicalEditor;
    const root = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    )!;
    root.focus();
    live.update(
      () => {
        const code = $createTextNode("fn_sweep_intake_retention");
        code.toggleFormat("code");
        const line = $createParagraphNode().append(code);
        $getRoot()
          .clear()
          .append(
            line,
            $createCheckBlockNode(false).append($createTextNode("a")),
            $createCheckBlockNode(false),
          );
        if (how === "by its line") code.selectEnd();
        else code.select(0, code.getTextContentSize());
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
      expect(blocks(live).slice(1)).toStrictEqual([
        { type: "todo", text: "a", indent: 0, checked: false },
        {
          type: "todo",
          text: "fn_sweep_intake_retention",
          indent: 0,
          checked: false,
        },
      ]),
    );
  });
}

/**
 * The whole of one line copied (dragged over), pasted after words on
 * another: in Notion its words join that line. Here a new list item came
 * in below it.
 */
test("a whole line pasted after words joins their line", async () => {
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
      const words = $createTextNode("đồng nhất các cụm");
      $getRoot()
        .clear()
        .append(
          $createListNode("bullet").append(
            $createListItemNode().append($createTextNode("Giúp ")),
            $createListItemNode().append(words),
          ),
        );
      words.select(0, words.getTextContentSize());
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
  live.update(() => $getRoot().getAllTextNodes()[0]!.selectEnd(), {
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
      live.getEditorState().read(() =>
        $getRoot()
          .getAllTextNodes()
          .map((text) => text.getParent()?.getTextContent()),
      ),
    ).toStrictEqual(["Giúp đồng nhất các cụm", "đồng nhất các cụm"]),
  );
});

/**
 * Cmd+C with the caret on a line of several runs — words, then inline code:
 * only the last run went on the clipboard ("minor_unit" pasted alone), and
 * the caret jumped to the end of the line. The line goes whole; the caret
 * stays.
 */
test("a line copied by the caret goes whole, and the caret stays", async () => {
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
      const words = $createTextNode("Round USD Price ->use ");
      const code = $createTextNode("minor_unit");
      code.toggleFormat("code");
      $getRoot()
        .clear()
        .append(
          $createCheckBlockNode(true).append(words, code),
          $createParagraphNode(),
        );
      words.select(5, 5);
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

  expect(clipboardData.getData("text/plain")).toBe(
    "Round USD Price ->use minor_unit",
  );
  expect(clipboardData.getData("text/html")).toContain("Round USD Price");
  expect(clipboardData.getData("text/html")).toContain("minor_unit");
  expect(
    live.getEditorState().read(() => {
      const selection = $getSelection();
      return $isRangeSelection(selection)
        ? `${selection.anchor.getNode().getTextContent()}@${selection.anchor.offset}`
        : null;
    }),
  ).toBe("Round USD Price ->use @5");

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
    expect(blocks(live)).toStrictEqual([
      {
        type: "todo",
        text: "Round USD Price ->use minor_unit",
        indent: 0,
        checked: true,
      },
      {
        type: "todo",
        text: "Round USD Price ->use minor_unit",
        indent: 0,
        checked: true,
      },
    ]),
  );
});

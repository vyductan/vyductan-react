import type { LexicalEditor, LexicalNode } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTableNodeWithDimensions } from "@lexical/table";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createTextNode, $getRoot, $getState, $isElementNode } from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";
import { unmarkedState } from "../utils/list-marker";

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

/*
 * A copy taken from the middle of a list, as Chrome puts it on the clipboard
 * (from Antigravity's chat): the outer items are bare `<li>`s, with no `<ul>`
 * around them, and whitespace between the tags.
 */
const MID_LIST_COPY = `<meta charset='utf-8'><li><strong>Third try:</strong>
  
  <ul>
  <li>Show a <strong>CAPTCHA</strong>.</li>
  <li>Show tries left.</li>
  </ul></li>
  <li><strong>Fifth try:</strong>
  
  <ul>
  <li><strong>Locked:</strong> a notice:
  <blockquote class="relative my-2 pl-4">
  <p class=""><em>"Try again later."</em></p></blockquote></li></ul></li>`;

/** The list's items: words, `[nested]` for a holder, `~` for unmarked. */
function $outline(list: LexicalNode, depth = 0): string[] {
  if (!$isElementNode(list)) return [];
  return list.getChildren().flatMap((item) => {
    if (!$isElementNode(item)) return [];
    const children = item.getChildren();
    if (children.length > 0 && children.every((c) => c.getType() === "list")) {
      return children.flatMap((nested) => $outline(nested, depth + 1));
    }
    const mark = $getState(item, unmarkedState) ? "~ " : "• ";
    const words = children
      .filter((c) => c.getType() !== "list")
      .map((c) => c.getTextContent())
      .join("")
      .trim();
    return [`${"  ".repeat(depth)}${mark}${words}`];
  });
}

async function pasteIntoListItem(inCell: boolean) {
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
      const empty = $createListItemNode();
      const list = $createListNode("bullet").append(
        $createListItemNode().append($createTextNode("First tries:")),
        $createListItemNode().append($createListNodeWith("A gentle notice")),
        empty,
      );
      if (inCell) {
        const table = $createTableNodeWithDimensions(1, 1, false);
        $getRoot().clear().append(table);
        const row = table.getFirstChildOrThrow();
        const cell = $isElementNode(row) ? row.getFirstChild() : null;
        if ($isElementNode(cell)) cell.clear().append(list);
      } else {
        $getRoot().clear().append(list);
      }
      empty.select();
    },
    { discrete: true },
  );
  const clipboardData = new DataTransfer();
  clipboardData.setData("text/html", MID_LIST_COPY);
  clipboardData.setData("text/plain", "Third try:");
  root.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );
  return live;
}

function $createListNodeWith(text: string) {
  return $createListNode("bullet").append(
    $createListItemNode().append($createTextNode(text)),
  );
}

const outline = (live: LexicalEditor) =>
  live.getEditorState().read(() => {
    let list: LexicalNode | null = null;
    for (const node of $getRoot().getAllTextNodes()) {
      list = node.getParentOrThrow().getParentOrThrow();
      break;
    }
    return list ? $outline(list) : [];
  });

const EXPECTED = [
  "• First tries:",
  "  • A gentle notice",
  "• Third try:",
  "  • Show a CAPTCHA.",
  "  • Show tries left.",
  "• Fifth try:",
  `  • Locked: a notice:"Try again later."`,
];

/**
 * A copy from the middle of a list pasted on an empty item: each pasted item
 * keeps its bullet, its nested items under it. They came in holding their
 * nested list beside their words, and showed with no bullet.
 */
test("a copy from mid-list keeps its bullets, pasted in a list in a cell", async () => {
  const live = await pasteIntoListItem(true);
  await waitFor(() => expect(outline(live)).toStrictEqual(EXPECTED));
});

test("a copy from mid-list keeps its bullets, pasted in a list on the page", async () => {
  const live = await pasteIntoListItem(false);
  await waitFor(() => expect(outline(live)).toStrictEqual(EXPECTED));
});

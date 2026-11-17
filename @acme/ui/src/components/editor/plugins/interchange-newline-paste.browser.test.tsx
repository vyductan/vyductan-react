import type { LexicalEditor, LexicalNode } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
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

/*
 * A title copied from a web page (YouTube's, here) as Chrome puts it on the
 * clipboard when the selection began at the end of the line above: a
 * `<br class="Apple-interchange-newline">` first, then the words.
 */
const COPIED_TITLE = `<meta charset='utf-8'><br class="Apple-interchange-newline"><span style="font-weight: 700;">Lauren Tan Reveals</span>`;

/** Each top-level block as `type:words`, a list as its items. */
function $blocks(): unknown[] {
  return $getRoot()
    .getChildren()
    .map((node: LexicalNode) =>
      node.getType() === "list" && $isElementNode(node)
        ? { list: node.getChildren().map((item) => item.getTextContent()) }
        : `${node.getType()}:${node.getTextContent()}`,
    );
}

async function pasteInto(build: () => void) {
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
      const top = $createParagraphNode().append($createTextNode("Top"));
      $getRoot().clear().append(top);
      // Appends its block and puts the caret in it.
      build();
    },
    { discrete: true },
  );
  const clipboardData = new DataTransfer();
  clipboardData.setData("text/html", COPIED_TITLE);
  clipboardData.setData("text/plain", "\nLauren Tan Reveals");
  root.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );
  return live;
}

const blocks = (live: LexicalEditor) => live.getEditorState().read($blocks);

/*
 * As Notion takes it: the line break Chrome puts first is a new block. On
 * an empty item the item stays, and the words go in a line of their own
 * after it, out of the list — they had gone in the item, a line down.
 */
test("pasted on an empty list item, the words go on a line after the list", async () => {
  const live = await pasteInto(() => {
    const item = $createListItemNode();
    $getRoot().append($createListNode("number").append(item));
    item.select();
  });
  await waitFor(() =>
    expect(blocks(live)).toStrictEqual([
      "paragraph:Top",
      { list: [""] },
      "paragraph:Lauren Tan Reveals",
    ]),
  );
});

test("pasted at the end of an item with words, the items after it stay a list after the line", async () => {
  const live = await pasteInto(() => {
    const item = $createListItemNode().append($createTextNode("Item"));
    $getRoot().append(
      $createListNode("number").append(
        item,
        $createListItemNode().append($createTextNode("Next")),
      ),
    );
    item.selectEnd();
  });
  await waitFor(() =>
    expect(blocks(live)).toStrictEqual([
      "paragraph:Top",
      { list: ["Item"] },
      "paragraph:Lauren Tan Reveals",
      { list: ["Next"] },
    ]),
  );
});

test("pasted at the end of a line with words, they go on a line after it", async () => {
  const live = await pasteInto(() => {
    const line = $createParagraphNode().append($createTextNode("Words"));
    $getRoot().append(line);
    line.selectEnd();
  });
  await waitFor(() =>
    expect(blocks(live)).toStrictEqual([
      "paragraph:Top",
      "paragraph:Words",
      "paragraph:Lauren Tan Reveals",
    ]),
  );
});

test("pasted on an empty line, the words take that line", async () => {
  const live = await pasteInto(() => {
    const line = $createParagraphNode();
    $getRoot().append(line);
    line.select();
  });
  await waitFor(() =>
    expect(blocks(live)).toStrictEqual([
      "paragraph:Top",
      "paragraph:Lauren Tan Reveals",
    ]),
  );
});

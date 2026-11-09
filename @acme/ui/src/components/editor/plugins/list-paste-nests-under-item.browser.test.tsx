import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createTextNode, $getRoot, $isElementNode } from "lexical";
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
 * A numbered item and the bullet under it, copied from a chat: Chrome leaves
 * out the `<ol>` around the selection's start, so the item's words come as
 * bare inline spans, then the nested `<ul>`.
 */
const ITEM_WITH_NESTED = `<meta charset='utf-8'><span><strong>Showcase trên Homepage &amp; Landing Page:</strong></span><span>
 </span><span> </span><ul>
  <li><span>Homepage </span><span>không thể tải.</span></li></ul>`;

/** Each item as `depth:type:words`, holders skipped. */
function $outline(): string[] {
  const out: string[] = [];
  const walk = (list: unknown, depth: number) => {
    if (!$isElementNode(list as never)) return;
    const node = list as ReturnType<typeof $createListNode>;
    for (const item of node.getChildren()) {
      if (!$isElementNode(item)) continue;
      const words = item
        .getChildren()
        .filter((c) => c.getType() !== "list")
        .map((c) => c.getTextContent())
        .join("")
        .trim();
      if (words || item.getChildrenSize() === 0) {
        out.push(`${depth}:${node.getListType()}:${words}`);
      }
      for (const c of item.getChildren()) {
        if (c.getType() === "list") walk(c, depth + 1);
      }
    }
  };
  for (const top of $getRoot().getChildren()) {
    if (top.getType() === "list") walk(top, 0);
    else out.push(`${top.getType()}:${top.getTextContent().trim()}`);
  }
  return out;
}

async function paste(onWords: boolean) {
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
      const target = $createListItemNode();
      if (onWords) target.append($createTextNode("Hai: "));
      $getRoot()
        .clear()
        .append(
          $createListNode("number").append(
            $createListItemNode().append($createTextNode("Chọn sản phẩm")),
            target,
          ),
        );
      target.selectEnd();
    },
    { discrete: true },
  );
  const clipboardData = new DataTransfer();
  clipboardData.setData("text/html", ITEM_WITH_NESTED);
  clipboardData.setData("text/plain", "Showcase");
  root.dispatchEvent(
    new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData }),
  );
  return live;
}

test("an item's words and its nested list, pasted on an empty item, stay nested", async () => {
  const live = await paste(false);
  await waitFor(() =>
    expect(live.getEditorState().read($outline)).toStrictEqual([
      "0:number:Chọn sản phẩm",
      "0:number:Showcase trên Homepage & Landing Page:",
      "1:bullet:Homepage không thể tải.",
    ]),
  );
});

test("pasted after words on an item, the words join them and the list nests", async () => {
  const live = await paste(true);
  await waitFor(() =>
    expect(live.getEditorState().read($outline)).toStrictEqual([
      "0:number:Chọn sản phẩm",
      "0:number:Hai: Showcase trên Homepage & Landing Page:",
      "1:bullet:Homepage không thể tải.",
    ]),
  );
});

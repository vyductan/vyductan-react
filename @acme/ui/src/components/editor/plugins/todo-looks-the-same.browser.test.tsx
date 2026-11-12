import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";
import { $createCheckBlockNode } from "../nodes/check-block-node";

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

/** Where a to-do's box and words sit, relative to the block's left edge. */
function geometry(block: HTMLElement, box: { el: Element; pseudo?: string }) {
  const left = block.getBoundingClientRect().left;
  const style = getComputedStyle(box.el, box.pseudo);
  const boxLeft = box.pseudo
    ? left + Number.parseFloat(style.left)
    : box.el.getBoundingClientRect().left;
  const range = document.createRange();
  range.selectNodeContents(block.querySelector('[data-lexical-text="true"]')!);
  return {
    boxLeft: Math.round(boxLeft - left),
    boxSize: Math.round(Number.parseFloat(style.width)),
    border: style.borderTopColor,
    borderWidth: style.borderTopWidth,
    radius: style.borderTopLeftRadius,
    textLeft: Math.round(range.getBoundingClientRect().left - left),
  };
}

/*
 * A to-do made in the editor (the slash menu, Turn into) is a checklist item;
 * the same to-do read back from a markdown file is a CheckBlockNode. They
 * drew differently — a grey box in one, an accent-colored one with its words
 * a column nearer in the other — so a file looked changed on reopening.
 */
test.each([false, true])(
  "a to-do (checked: %s) looks the same as a checklist item and as a check block",
  async (checked) => {
    let editor: LexicalEditor | null = null;
    render(
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>,
    );
    await waitFor(() => expect(editor).not.toBeNull());
    (editor as unknown as LexicalEditor).update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createListNode("check").append(
              $createListItemNode(checked).append($createTextNode("Made here")),
            ),
            $createCheckBlockNode(checked).append($createTextNode("Read back")),
          );
      },
      { discrete: true },
    );
    const root = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    )!;
    const item = await waitFor(() => root.querySelector<HTMLElement>("li")!);
    const block =
      root.querySelector<HTMLElement>("[data-check-icon]")!.parentElement!;
    const list = item.closest("ul")!;
    // The list's own left edge is where a check block's is.
    expect(list.getBoundingClientRect().left).toBe(
      block.getBoundingClientRect().left,
    );
    expect(
      geometry(block, { el: block.querySelector("[data-check-icon]")! }),
    ).toStrictEqual(geometry(item, { el: item, pseudo: "::before" }));
  },
);

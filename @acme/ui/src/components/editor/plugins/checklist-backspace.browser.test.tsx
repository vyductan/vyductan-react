import type { LexicalEditor, LexicalNode } from "lexical";
import * as React from "react";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";
import { $isUnmarkedItem } from "../utils/list-marker";

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
  $createListItemNode(false).append($createTextNode(text));

/** To-dos "a", an empty one nested under it, then "b" — as /todo makes them. */
async function renderChecklist() {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  await userEvent.click(
    document.querySelector<HTMLElement>('[contenteditable="true"]')!,
  );
  live.update(
    () => {
      const empty = $createListItemNode(false);
      $getRoot()
        .clear()
        .append(
          $createListNode("check").append(
            item("a"),
            $createListItemNode().append($createListNode("check").append(empty)),
            item("b"),
          ),
        );
      empty.select();
    },
    { discrete: true },
  );
  return live;
}

/** Each line of the checklist: its depth, text, and whether it is unmarked. */
const lines = (live: LexicalEditor) =>
  live.getEditorState().read(() => {
    const out: { depth: number; text: string; unmarked: boolean }[] = [];
    const walk = (list: LexicalNode | null, depth: number) => {
      if (!$isListNode(list)) return;
      for (const child of list.getChildren()) {
        if (!$isListItemNode(child)) continue;
        const nested = child.getFirstChild();
        if ($isListNode(nested)) {
          walk(nested, depth + 1);
          continue;
        }
        out.push({
          depth,
          text: child.getTextContent(),
          unmarked: $isUnmarkedItem(child),
        });
      }
    };
    walk($getRoot().getFirstChild(), 0);
    return out;
  });

/**
 * Backspace at the start of a nested to-do took it out a level, checkbox
 * and all. In Notion the checkbox goes and the line stays where it is, as
 * text.
 */
test("Backspace at the start of a nested to-do drops its checkbox, not its depth", async () => {
  const live = await renderChecklist();

  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(lines(live)).toStrictEqual([
      { depth: 0, text: "a", unmarked: false },
      { depth: 1, text: "", unmarked: true },
      { depth: 0, text: "b", unmarked: false },
    ]),
  );
  const nested = document.querySelectorAll<HTMLLIElement>(
    '[contenteditable="true"] li li',
  )[0]!;
  expect(getComputedStyle(nested, "::before").display).toBe("none");
  expect(nested.getAttribute("role")).toBeNull();
});

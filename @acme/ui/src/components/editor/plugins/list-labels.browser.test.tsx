import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode, ListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";
import { EditorRender } from "../editor-render";

// Runs in the `browser` project so the editor mounts exactly as in the app.

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

/** A list nested `depth` levels deep, one item per level. */
function $nestedList(type: "number" | "bullet", depth: number): ListNode {
  const list = $createListNode(type).append(
    $createListItemNode().append($createTextNode("level 1")),
  );
  let current = list;
  for (let level = 2; level <= depth; level += 1) {
    const inner = $createListNode(type).append(
      $createListItemNode().append($createTextNode(`level ${level}`)),
    );
    current.append($createListItemNode().append(inner));
    current = inner;
  }
  return list;
}

/** Each list's marker class, outermost first. */
function markerClasses(container: ParentNode, tag: "ol" | "ul") {
  return [...container.querySelectorAll(tag)].map(
    (list) =>
      // The per-depth class is the one with "!": it overrides the list's
      // base `list-decimal` / `list-disc`.
      [...list.classList].find(
        (name) => name.startsWith("list-") && name.endsWith("!"),
      ) ?? "",
  );
}

async function renderEditorWith(build: () => void) {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  (editor as unknown as LexicalEditor).update(build, { discrete: true });
  return editor as unknown as LexicalEditor;
}

test("numbered levels go 1. → a. → i. and then start over, like Notion", async () => {
  const editor = await renderEditorWith(() => {
    $getRoot().clear().append($nestedList("number", 4));
  });

  await waitFor(() =>
    expect(markerClasses(document, "ol")).toEqual([
      "list-decimal!",
      "list-[lower-alpha]!",
      "list-[lower-roman]!",
      "list-decimal!",
    ]),
  );

  // The published renderer draws the same levels.
  const json = JSON.stringify(editor.getEditorState().toJSON());
  cleanup();
  const { container } = render(<EditorRender value={json} />);
  expect(markerClasses(container, "ol")).toEqual([
    "list-decimal!",
    "list-[lower-alpha]!",
    "list-[lower-roman]!",
    "list-decimal!",
  ]);
});

test("bulleted levels go • → ◦ → ▪ and then start over", async () => {
  await renderEditorWith(() => {
    $getRoot().clear().append($nestedList("bullet", 4));
  });

  await waitFor(() =>
    expect(markerClasses(document, "ul")).toEqual([
      "list-disc!",
      "list-[circle]!",
      "list-[square]!",
      "list-disc!",
    ]),
  );
});

/** Left edge of an element's text, not of its box. */
const textLeft = (element: Element) => {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect().left;
};

test("a checklist's box sits in the label column, its text where list text starts", async () => {
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
          $createListNode("number").append(
            $createListItemNode().append($createTextNode("numbered")),
          ),
          $createListNode("check").append(
            $createListItemNode(false).append($createTextNode("to do")),
          ),
        );
    },
    { discrete: true },
  );
  await waitFor(() =>
    expect(
      document.querySelectorAll('[contenteditable="true"] li'),
    ).toHaveLength(2),
  );

  const [numbered, check] = document.querySelectorAll<HTMLLIElement>(
    '[contenteditable="true"] li',
  );
  expect(Math.abs(textLeft(check!) - textLeft(numbered!))).toBeLessThan(1);
  // The box starts left of the text, inside the column the "1." sits in.
  const box = check!.getBoundingClientRect().left;
  expect(box).toBeLessThan(textLeft(numbered!) - 16);
});

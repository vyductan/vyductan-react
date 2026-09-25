import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode, ListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
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
/**
 * The marker each list draws, outermost first. Read from computed style
 * rather than class names: the levels come from descendant rules in the
 * theme, which count lists of the same kind above, not from a class per depth.
 */
function markerStyles(container: ParentNode, tag: "ol" | "ul") {
  return [...container.querySelectorAll<HTMLElement>(tag)].map(
    (list) => getComputedStyle(list).listStyleType,
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
    expect(markerStyles(document, "ol")).toEqual([
      "decimal",
      "lower-alpha",
      "lower-roman",
      "decimal",
    ]),
  );

  // The published renderer draws the same levels.
  const json = JSON.stringify(editor.getEditorState().toJSON());
  cleanup();
  const { container } = render(<EditorRender value={json} />);
  expect(markerStyles(container, "ol")).toEqual([
    "decimal",
    "lower-alpha",
    "lower-roman",
    "decimal",
  ]);
});

test("bulleted levels go • → ◦ → ▪ and then start over", async () => {
  await renderEditorWith(() => {
    $getRoot().clear().append($nestedList("bullet", 4));
  });

  await waitFor(() =>
    expect(markerStyles(document, "ul")).toEqual([
      "disc",
      "circle",
      "square",
      "disc",
    ]),
  );
});

/** Left edge of an element's text, not of its box. */
const textLeft = (element: Element) => {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect().left;
};

test("a checklist's box is drawn like Notion's: inset, centred on the line, grey", async () => {
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
          $createParagraphNode().append($createTextNode("Todo")),
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
    ).toHaveLength(1),
  );

  const paragraph = document.querySelector<HTMLElement>(
    '[contenteditable="true"] p',
  )!;
  const check = document.querySelector<HTMLLIElement>(
    '[contenteditable="true"] li',
  )!;
  const itemRect = check.getBoundingClientRect();
  const boxStyle = getComputedStyle(check, "::before");
  const box = {
    left: itemRect.left + Number.parseFloat(boxStyle.left),
    top: itemRect.top + Number.parseFloat(boxStyle.top),
    width: Number.parseFloat(boxStyle.width),
    height: Number.parseFloat(boxStyle.height),
  };
  const range = document.createRange();
  range.selectNodeContents(check);
  const line = range.getClientRects()[0]!;

  // A few pixels in from the text above, not flush with it.
  const inset = box.left - textLeft(paragraph);
  expect(inset).toBeGreaterThanOrEqual(2);
  expect(inset).toBeLessThanOrEqual(5);
  // Centred on the first line of the item's text.
  expect(
    Math.abs(box.top + box.height / 2 - (line.top + line.height / 2)),
  ).toBeLessThan(1.5);
  // Room between the box and the text.
  expect(textLeft(check) - (box.left + box.width)).toBeGreaterThanOrEqual(8);
  // Grey like the text, not the accent colour: an unticked box is not a
  // call to action.
  const [r, g, b] = (boxStyle.borderTopColor.match(/[\d.]+/g) ?? []).map(
    Number,
  );
  expect(Math.max(r!, g!, b!) - Math.min(r!, g!, b!)).toBeLessThan(20);
});

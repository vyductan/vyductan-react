import type { ElementNode, LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode } from "@lexical/rich-text";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Runs in the `browser` project: the prompt is a CSS pseudo-element, and the
// caret has to be a real one for its position to mean anything.

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

const PARAGRAPH_PROMPT = "Write, press ‘space’ for AI, ‘/’ for commands…";

async function renderEditor(build: () => void) {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.update(build, { discrete: true });
  await userEvent.click(
    document.querySelector<HTMLElement>('[contenteditable="true"]')!,
  );
  return live;
}

/** Move the caret with a discrete update, so the DOM follows at once. */
function caretInto(editor: LexicalEditor, select: () => void) {
  editor.update(select, { discrete: true });
}

/** The prompt each block currently draws, keyed by its tag. */
const prompts = () =>
  [
    ...document.querySelectorAll<HTMLElement>(
      '[contenteditable="true"] :is(p, li, h1, h2, h3)',
    ),
  ]
    .map((element) => ({
      tag: element.tagName.toLowerCase(),
      prompt: getComputedStyle(element, "::before").content,
    }))
    .filter(({ prompt }) => prompt !== "none" && prompt !== "normal");

test("an empty list item the caret is in shows “List”", async () => {
  const editor = await renderEditor(() => {
    $getRoot()
      .clear()
      .append(
        $createListNode("number").append(
          $createListItemNode().append($createTextNode("kk 1")),
          $createListItemNode(),
        ),
      );
  });
  caretInto(editor, () => {
    $getRoot()
      .getFirstChildOrThrow<ElementNode>()
      .getLastChildOrThrow<ElementNode>()
      .selectStart();
  });

  await waitFor(() =>
    expect(prompts()).toEqual([{ tag: "li", prompt: '"List"' }]),
  );
});

test("an empty paragraph shows the editor’s prompt, headings their level", async () => {
  const editor = await renderEditor(() => {
    $getRoot()
      .clear()
      .append(
        $createParagraphNode().append($createTextNode("above")),
        $createParagraphNode(),
        $createHeadingNode("h2"),
      );
  });

  caretInto(editor, () => {
    $getRoot().getChildAtIndex<ElementNode>(1)!.selectStart();
  });
  await waitFor(() =>
    expect(prompts()).toEqual([
      { tag: "p", prompt: JSON.stringify(PARAGRAPH_PROMPT) },
    ]),
  );

  // Only the line the caret is in: moving on clears the paragraph's.
  caretInto(editor, () => {
    $getRoot().getLastChildOrThrow<ElementNode>().selectStart();
  });
  await waitFor(() =>
    expect(prompts()).toEqual([{ tag: "h2", prompt: '"Heading 2"' }]),
  );
});

test("the prompt does not push the caret off the line's start", async () => {
  const editor = await renderEditor(() => {
    $getRoot()
      .clear()
      .append(
        $createParagraphNode().append($createTextNode("above")),
        $createParagraphNode(),
      );
  });
  caretInto(editor, () => {
    $getRoot().getLastChildOrThrow<ElementNode>().selectStart();
  });
  await waitFor(() => expect(prompts()).toHaveLength(1));

  const [above, empty] = document.querySelectorAll<HTMLElement>(
    '[contenteditable="true"] p',
  );
  const range = document.getSelection()!.getRangeAt(0).cloneRange();
  // A collapsed range in an empty block has no rect of its own; the <br> it
  // sits before does.
  const caretLeft =
    range.getBoundingClientRect().left ||
    empty!.querySelector("br")!.getBoundingClientRect().left;
  const textRange = document.createRange();
  textRange.selectNodeContents(above!);
  expect(
    Math.abs(caretLeft - textRange.getBoundingClientRect().left),
  ).toBeLessThan(1);
});

test("no prompt once the editor loses focus", async () => {
  const editor = await renderEditor(() => {
    $getRoot()
      .clear()
      .append(
        $createParagraphNode().append($createTextNode("above")),
        $createParagraphNode(),
      );
  });
  caretInto(editor, () => {
    $getRoot().getLastChildOrThrow<ElementNode>().selectStart();
  });
  await waitFor(() => expect(prompts()).toHaveLength(1));

  (document.activeElement as HTMLElement).blur();

  await waitFor(() => expect(prompts()).toEqual([]));
});

test("an unmarked list line reads as a paragraph", async () => {
  const editor = await renderEditor(() => {
    $getRoot()
      .clear()
      .append(
        $createListNode("number").append(
          $createListItemNode().append($createTextNode("kk 1")),
          $createListItemNode(),
        ),
      );
  });
  caretInto(editor, () => {
    $getRoot()
      .getFirstChildOrThrow<ElementNode>()
      .getLastChildOrThrow<ElementNode>()
      .selectStart();
  });
  await waitFor(() => expect(prompts()).toHaveLength(1));

  // Backspace in the empty item drops its label (ListMarkerPlugin).
  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(prompts()).toEqual([
      { tag: "li", prompt: JSON.stringify(PARAGRAPH_PROMPT) },
    ]),
  );
});

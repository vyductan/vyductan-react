import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import { $createTextNode, $getRoot, $isTextNode } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Real keys through the shipped editor: the Backspace that drops a marker is
// the list marker plugin's, and the space that brings one back is this one's.

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

afterEach(() => document.body.replaceChildren());

const item = (text: string) =>
  $createListItemNode().append($createTextNode(text));

/** 1. 11 / a. ex1  b. b  c. c / 2. 22 */
async function renderNested(outer: "number" | "bullet" = "number") {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.update(
    () => {
      $getRoot()
        .clear()
        .append(
          $createListNode(outer).append(
            item("11"),
            $createListItemNode().append(
              $createListNode("number").append(
                item("ex1"),
                item("b"),
                item("c"),
              ),
            ),
            item("22"),
          ),
        );
    },
    { discrete: true },
  );
  await waitFor(() =>
    expect(
      document.querySelector('[contenteditable="true"]')?.textContent,
    ).toContain("22"),
  );
  return live;
}

async function caretIn(editor: LexicalEditor, text: string, offset: number) {
  await userEvent.click(
    document.querySelector<HTMLElement>('[contenteditable="true"]')!,
  );
  editor.update(() => {
    const node = $getRoot()
      .getAllTextNodes()
      .find((candidate) => candidate.getTextContent() === text);
    if ($isTextNode(node)) node.select(offset, offset);
  });
}

/** The <li> that reads `text`, ignoring the holders of nested lists. */
const itemReading = (text: string) =>
  [
    ...document.querySelectorAll<HTMLLIElement>('[contenteditable="true"] li'),
  ].find(
    (li) =>
      li.textContent?.trim() === text &&
      !li.querySelector(":scope > ul, :scope > ol"),
  );

const marker = (text: string) => {
  const li = itemReading(text);
  if (!li) return "missing";
  const type = getComputedStyle(li).listStyleType;
  return type === "none" ? "" : `${type}:${li.value}`;
};

/**
 * Notion: Backspace at the start of "a. ex1" drops its marker, then typing
 * "- " there makes it a bullet — the lines after it carrying on as their own
 * numbered run. Here the "- " stayed on the line as text.
 */
test("typing '- ' at the start of an unmarked line makes it a bullet", async () => {
  const editor = await renderNested();
  await caretIn(editor, "ex1", 0);

  await userEvent.keyboard("{Backspace}");
  await waitFor(() => expect(marker("ex1")).toBe(""));

  await userEvent.keyboard("- ");

  // A bullet, in whichever shape the theme gives bullets at this depth.
  await waitFor(() => expect(marker("ex1")).toMatch(/^(disc|circle|square):/));
  expect(itemReading("ex1")?.textContent).toBe("ex1");
  // The rest of the nested run numbers on from 1, at the same depth.
  expect(marker("b")).toMatch(/:1$/);
  expect(marker("c")).toMatch(/:2$/);
  // The outer list is untouched.
  expect(marker("11")).toBe("decimal:1");
  expect(marker("22")).toBe("decimal:2");
});

test("typing '1. ' at the start of a bullet makes it numbered", async () => {
  const editor = await renderNested("bullet");
  await caretIn(editor, "22", 0);

  await userEvent.keyboard("1. ");

  await waitFor(() => expect(marker("22")).toBe("decimal:1"));
  expect(itemReading("22")?.textContent).toBe("22");
  expect(marker("11")).toBe("disc:1");
});

test("leaves a dash typed in the middle of a line alone", async () => {
  const editor = await renderNested();
  await caretIn(editor, "ex1", 2);

  await userEvent.keyboard("- ");

  await waitFor(() => expect(itemReading("ex- 1")).toBeDefined());
  expect(marker("ex- 1")).toMatch(/^lower-alpha:1$/);
});

test("changes nothing when the marker typed is the list's own", async () => {
  const editor = await renderNested();
  await caretIn(editor, "b", 0);

  await userEvent.keyboard("1. ");

  await waitFor(() => expect(itemReading("1. b")).toBeDefined());
});

/** An unmarked line of a numbered list gets its number back from "1. ". */
test("gives an unmarked numbered line its number back", async () => {
  const editor = await renderNested();
  await caretIn(editor, "b", 0);

  await userEvent.keyboard("{Backspace}");
  await waitFor(() => expect(marker("b")).toBe(""));

  await userEvent.keyboard("1. ");

  await waitFor(() => expect(marker("b")).toBe("lower-alpha:2"));
  expect(itemReading("b")?.textContent).toBe("b");
});

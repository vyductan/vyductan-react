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

/**
 * Where the previous test leaves off: "• a" sits between "11" and a nested
 * "a. b  b. c". Backspace, then "a. " — the letter it would show — makes it
 * numbered again, and it joins the numbered run after it: a. a  b. b  c. c.
 * The letter was not taken for a marker, and a new item started a run of its
 * own, so the list after it counted from "a." again.
 */
test("typing 'a. ' brings a line back into the numbered run beside it", async () => {
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
          $createListNode("number").append(
            item("11"),
            $createListItemNode().append(
              $createListNode("bullet").append(item("a")),
            ),
            $createListItemNode().append(
              $createListNode("number").append(item("b"), item("c")),
            ),
            item("22"),
          ),
        );
    },
    { discrete: true },
  );
  await waitFor(() => expect(marker("a")).toMatch(/^disc:/));

  await caretIn(live, "a", 0);
  await userEvent.keyboard("{Backspace}");
  await waitFor(() => expect(marker("a")).toBe(""));
  await userEvent.keyboard("a. ");

  await waitFor(() => expect(marker("a")).toBe("lower-alpha:1"));
  expect(itemReading("a")?.textContent).toBe("a");
  expect(marker("b")).toBe("lower-alpha:2");
  expect(marker("c")).toBe("lower-alpha:3");
  expect(marker("22")).toBe("decimal:2");
  // One nested run, not two side by side.
  expect(
    document.querySelectorAll('[contenteditable="true"] ol ol').length,
  ).toBe(1);
});

test("takes a roman numeral for a numbered marker too", async () => {
  const editor = await renderNested("bullet");
  await caretIn(editor, "22", 0);

  await userEvent.keyboard("i. ");

  await waitFor(() => expect(marker("22")).toBe("decimal:1"));
  expect(itemReading("22")?.textContent).toBe("22");
});

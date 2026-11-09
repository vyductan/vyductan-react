import type { LexicalEditor } from "lexical";
import * as React from "react";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
} from "@lexical/list";
import { $convertToMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createTextNode,
  $getRoot,
  $getSelection,
  $getState,
  $isRangeSelection,
  $isTextNode,
  $setState,
} from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";
import { EditorRender } from "../editor-render";
import { MARKDOWN_DOCUMENT_TRANSFORMERS } from "../transformers/markdown-transformers";
import { markdownToLexicalContent } from "../utils/lexical-converter";
import { unmarkedState } from "../utils/list-marker";

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
  $createListItemNode().append($createTextNode(text));

async function renderList(type: "number" | "bullet" = "number") {
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
          $createListNode(type).append(item("aa"), item("bb"), item("cc")),
        );
    },
    { discrete: true },
  );
  await waitFor(() =>
    expect(
      document.querySelectorAll('[contenteditable="true"] li'),
    ).toHaveLength(3),
  );
  return live;
}

/** Put the caret at `offset` in the text of the item reading `text`. */
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

const items = () => [
  ...document.querySelectorAll<HTMLLIElement>('[contenteditable="true"] li'),
];

/** What each item shows: its number (or bullet) and text; "" when unmarked. */
const markers = () =>
  items().map((li) => ({
    text: li.textContent,
    marker:
      getComputedStyle(li).listStyleType === "none" ? "" : String(li.value),
  }));

test("Backspace at the start of an item drops its marker but keeps it in the list", async () => {
  const editor = await renderList();
  await caretIn(editor, "bb", 0);

  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(markers()).toEqual([
      { text: "aa", marker: "1" },
      { text: "bb", marker: "" },
      // The unmarked line is a continuation of "aa": it takes no number.
      { text: "cc", marker: "2" },
    ]),
  );
  expect(
    editor.getEditorState().read(() =>
      $getRoot()
        .getAllTextNodes()
        .map((node) => [
          node.getTextContent(),
          $isListItemNode(node.getParent()),
        ]),
    ),
  ).toEqual([
    ["aa", true],
    ["bb", true],
    ["cc", true],
  ]);
});

test("Backspace in the middle of an item still deletes a character", async () => {
  const editor = await renderList();
  await caretIn(editor, "bb", 1);

  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(markers()).toEqual([
      { text: "aa", marker: "1" },
      { text: "b", marker: "2" },
      { text: "cc", marker: "3" },
    ]),
  );
});

/**
 * As in Notion: Backspace again at the start of an unmarked line joins its
 * words to the line above. It took the line out of the list, cutting the
 * list in two.
 */
test("Backspace again on an unmarked line joins it to the line above", async () => {
  const editor = await renderList();
  await caretIn(editor, "bb", 0);
  await userEvent.keyboard("{Backspace}");
  await waitFor(() => expect(markers()[1]?.marker).toBe(""));

  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(markers()).toEqual([
      { text: "aabb", marker: "1" },
      { text: "cc", marker: "2" },
    ]),
  );
  expect(
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      return $isRangeSelection(selection)
        ? `${selection.anchor.getNode().getTextContent()}@${selection.anchor.offset}`
        : null;
    }),
  ).toBe("aabb@2");
});

test("the published view hides the marker and numbers the same way", async () => {
  const editor = await renderList();
  await caretIn(editor, "bb", 0);
  await userEvent.keyboard("{Backspace}");
  await waitFor(() => expect(markers()[1]?.marker).toBe(""));

  const json = JSON.stringify(editor.getEditorState().toJSON());
  cleanup();
  const { container } = render(<EditorRender value={json} />);
  const published = [...container.querySelectorAll<HTMLLIElement>("li")].map(
    (li) => ({
      text: li.textContent,
      marker:
        getComputedStyle(li).listStyleType === "none" ? "" : String(li.value),
    }),
  );

  expect(published).toEqual([
    { text: "aa", marker: "1" },
    { text: "bb", marker: "" },
    { text: "cc", marker: "2" },
  ]);
});

/** Left edge of an element's text, not of its box. */
const textLeft = (element: Element) => {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect().left;
};

/**
 * Where `item`'s marker starts, measured rather than computed: switching the
 * marker inside pushes the text right by exactly the marker's width.
 */
function markerStart(item: HTMLLIElement): number {
  const outside = textLeft(item);
  item.style.listStylePosition = "inside";
  const inside = textLeft(item);
  item.style.listStylePosition = "";
  return outside - (inside - outside);
}

test.each(["number", "bullet"] as const)(
  "an unmarked %s item's text starts where the markers start",
  async (type) => {
    const editor = await renderList(type);
    await caretIn(editor, "bb", 0);
    await userEvent.keyboard("{Backspace}");
    await waitFor(() => expect(markers()[1]?.marker).toBe(""));

    // Measured once, outside waitFor: markerStart mutates a style, and
    // waitFor re-runs its callback on every DOM mutation — it looped forever.
    await new Promise((resolve) => setTimeout(resolve, 100));
    const [first, unmarked] = items();
    expect(Math.abs(textLeft(unmarked!) - markerStart(first!))).toBeLessThan(
      1.5,
    );
  },
);

test("Enter on an unmarked line starts another one, aligned with it", async () => {
  const editor = await renderList();
  await caretIn(editor, "bb", 0);
  await userEvent.keyboard("{Backspace}");
  await waitFor(() => expect(markers()[1]?.marker).toBe(""));
  await caretIn(editor, "bb", 2);
  await userEvent.keyboard("{Enter}dd");
  await waitFor(() => expect(items()).toHaveLength(4));
  await new Promise((resolve) => setTimeout(resolve, 100));

  const [first, bb, dd] = items();
  expect(markers()[2]).toEqual({ text: "dd", marker: "" });
  expect(Math.abs(textLeft(dd!) - textLeft(bb!))).toBeLessThan(1.5);
  expect(Math.abs(textLeft(dd!) - markerStart(first!))).toBeLessThan(1.5);
});

test("unmarked lines with no labelled item above still line up", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const unmarkedItem = (text: string) => {
    const node = item(text);
    $setState(node, unmarkedState, true);
    return node;
  };
  // Third level numbers i./ii./iii.: the hidden numerals differ in width.
  (editor as unknown as LexicalEditor).update(
    () => {
      $getRoot()
        .clear()
        .append(
          $createListNode("number").append(
            item("top"),
            $createListItemNode().append(
              $createListNode("number").append(
                item("mid"),
                $createListItemNode().append(
                  $createListNode("number").append(
                    unmarkedItem("one"),
                    unmarkedItem("two"),
                    unmarkedItem("three"),
                  ),
                ),
              ),
            ),
          ),
        );
    },
    { discrete: true },
  );
  await waitFor(() => expect(items()).toHaveLength(7));
  await new Promise((resolve) => setTimeout(resolve, 100));

  const lefts = items()
    .filter((li) => ["one", "two", "three"].includes(li.textContent ?? ""))
    .map((li) => textLeft(li));
  expect(lefts).toHaveLength(3);
  expect(Math.max(...lefts) - Math.min(...lefts)).toBeLessThan(1);
});

/**
 * As in Notion: Enter at the end of an item, then Backspace twice, and the
 * new line is gone — the caret back where it was. The second Backspace took
 * the empty line out of the list instead: a paragraph at the margin that cut
 * the list in two, the items after it nested a level off.
 */
test("Backspace on an empty unmarked line removes it, the list as it was", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  const markdown = [
    "1. Khách điền form",
    "\t- Nguy cơ",
    "\t- Giải pháp: ???",
    "\t\t- Nếu giữ chỗ:",
    "\t\t- Nếu không giữ chỗ",
    "\t- Dùng Cron Job",
  ].join("\n");
  live.setEditorState(
    live.parseEditorState(JSON.stringify(markdownToLexicalContent(markdown))),
  );
  const before = live
    .getEditorState()
    .read(() => $convertToMarkdownString(MARKDOWN_DOCUMENT_TRANSFORMERS));

  await caretIn(live, "Nếu giữ chỗ:", "Nếu giữ chỗ:".length);
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard("{Backspace}");
  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(
      live
        .getEditorState()
        .read(() => $convertToMarkdownString(MARKDOWN_DOCUMENT_TRANSFORMERS)),
    ).toBe(before),
  );
  expect(
    live.getEditorState().read(() => {
      const selection = $getSelection();
      return $isRangeSelection(selection)
        ? `${selection.anchor.getNode().getTextContent()}@${selection.anchor.offset}`
        : null;
    }),
  ).toBe(`Nếu giữ chỗ:@${"Nếu giữ chỗ:".length}`);
});

/** Nested: the words go up to the nested line above, the list as it was. */
test("an unmarked nested line joins the nested line above", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.setEditorState(
    live.parseEditorState(
      JSON.stringify(
        markdownToLexicalContent(
          ["- Giải pháp", "\t- Nếu giữ chỗ:", "\t- c", "\t- Nếu không"].join(
            "\n",
          ),
        ),
      ),
    ),
  );

  await caretIn(live, "c", 0);
  await userEvent.keyboard("{Backspace}");
  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(
      live
        .getEditorState()
        .read(() => $convertToMarkdownString(MARKDOWN_DOCUMENT_TRANSFORMERS)),
    ).toBe(["- Giải pháp", "\t- Nếu giữ chỗ:c", "\t- Nếu không"].join("\n")),
  );
});

/**
 * As in Notion: on the last line of a nested list, Backspace twice on a new,
 * empty line takes it out a level — here out of the list, a paragraph at the
 * margin — rather than removing it. Once more and it goes, the caret back at
 * the end of the line above. Removing it at the second press left no way to
 * write on below the list.
 */
test("Backspace on an empty last nested line takes it out a level", async () => {
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
            item("Chiến lược thương mại"),
            $createListItemNode().append(
              $createListNode("bullet").append(
                item("Push sản phẩm"),
                item("Theo mùa"),
              ),
            ),
          ),
        );
    },
    { discrete: true },
  );
  const blocks = () =>
    live.getEditorState().read(() =>
      $getRoot()
        .getChildren()
        .map((child) => `${child.getType()}:${child.getTextContent()}`),
    );
  const caret = () =>
    live.getEditorState().read(() => {
      const selection = $getSelection();
      return $isRangeSelection(selection)
        ? `${selection.anchor.getNode().getType()}:${selection.anchor.getNode().getTextContent()}@${selection.anchor.offset}`
        : null;
    });

  const [list] = blocks();
  await caretIn(live, "Theo mùa", "Theo mùa".length);
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard("{Backspace}");
  await userEvent.keyboard("{Backspace}");

  await waitFor(() => expect(blocks()).toEqual([list, "paragraph:"]));
  expect(caret()).toBe("paragraph:@0");

  await userEvent.keyboard("{Backspace}");
  await waitFor(() => expect(blocks()).toEqual([list]));
  expect(caret()).toBe(`text:Theo mùa@${"Theo mùa".length}`);
});

/** Two levels in, the first time out it goes up one, still in the list. */
test("an empty last line two levels in goes up one level", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.setEditorState(
    live.parseEditorState(
      JSON.stringify(
        markdownToLexicalContent(
          ["- Giải pháp", "\t- Nếu giữ chỗ", "\t\t- a"].join("\n"),
        ),
      ),
    ),
  );

  await caretIn(live, "a", 1);
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard("{Backspace}");
  await userEvent.keyboard("{Backspace}");
  await userEvent.keyboard("x");

  await waitFor(() =>
    expect(
      live.getEditorState().read(() => {
        const node = $getRoot()
          .getAllTextNodes()
          .find((text) => text.getTextContent() === "x");
        const item = node?.getParent();
        return item && $isListItemNode(item)
          ? {
              indent: item.getIndent(),
              unmarked: $getState(item, unmarkedState),
            }
          : null;
      }),
    ).toEqual({ indent: 1, unmarked: true }),
  );
});

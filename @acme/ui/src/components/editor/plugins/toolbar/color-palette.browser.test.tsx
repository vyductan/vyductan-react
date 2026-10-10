import type { LexicalEditor, TextNode } from "lexical";
import * as React from "react";
import { $convertToMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { ConfigProvider } from "@acme/ui/components/config-provider";

import type { EditorColorPalette } from "./editor-color-palette";
import { Editor } from "../../editor";
import { MARKDOWN_DOCUMENT_TRANSFORMERS } from "../../transformers/markdown-transformers";

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

/**
 * An editor with "hot" selected, in the given variant and palette — the
 * palette set as an app does, once, on its ConfigProvider.
 */
async function editorWithSelection(
  variant: "simple" | "default",
  palette?: EditorColorPalette,
) {
  let editor: LexicalEditor | null = null;
  const tree = (
    <Editor autoFocus={false} variant={variant}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>
  );
  render(
    palette ? (
      <ConfigProvider editor={{ colorPalette: palette }}>{tree}</ConfigProvider>
    ) : (
      tree
    ),
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  document.querySelector<HTMLElement>('[contenteditable="true"]')!.focus();
  live.update(
    () => {
      const hot = $createTextNode("hot");
      $getRoot()
        .clear()
        .append($createParagraphNode().append(hot, $createTextNode(" take")));
      hot.select(0, 3);
    },
    { discrete: true },
  );
  return live;
}

const styleOfHot = (live: LexicalEditor) =>
  live.getEditorState().read(() => {
    const hot = $getRoot()
      .getAllTextNodes()
      .find((node: TextNode) => node.getTextContent() === "hot");
    return hot?.getStyle() ?? "";
  });

const markdownOf = (live: LexicalEditor) =>
  live
    .getEditorState()
    .read(() => $convertToMarkdownString(MARKDOWN_DOCUMENT_TRANSFORMERS));

const popover = () =>
  waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[data-slot="popover-content"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

const NOTION_NAMES = [
  "Gray",
  "Brown",
  "Orange",
  "Yellow",
  "Green",
  "Blue",
  "Purple",
  "Pink",
  "Red",
];

/**
 * The nlabs apps pick any color, as they did before the palette was closed:
 * left unset, the fixed toolbar's pickers are free again, a hex field and
 * all.
 */
test("by default the fixed toolbar picks colors freely", async () => {
  await editorWithSelection("simple");

  await userEvent.click(document.querySelector('[title="Text Color"]')!);
  expect(
    (await popover()).querySelector('input[placeholder="Enter color"]'),
  ).not.toBeNull();
});

test("by default a color typed into the fixed toolbar's picker is applied", async () => {
  const live = await editorWithSelection("simple");

  await userEvent.click(document.querySelector('[title="Text Color"]')!);
  const input = (await popover()).querySelector<HTMLInputElement>(
    'input[placeholder="Enter color"]',
  )!;
  await userEvent.clear(input);
  await userEvent.type(input, "#123456");
  await userEvent.tab();

  await waitFor(() => expect(styleOfHot(live)).toContain("#123456"));
});

test("by default the fixed toolbar's highlight picks freely too", async () => {
  await editorWithSelection("simple");

  await userEvent.click(document.querySelector('[title="Highlight Color"]')!);
  expect(
    (await popover()).querySelector('input[placeholder="Enter color"]'),
  ).not.toBeNull();
});

/**
 * VD Markdown and vyductan.dev keep to Notion's colors: the ones a markdown
 * file (Notion-flavored) can carry, and Notion sync with it.
 */
test("with the Notion palette the fixed toolbar offers Notion's colors, no field", async () => {
  await editorWithSelection("simple", "notion");

  await userEvent.click(document.querySelector('[title="Text Color"]')!);
  const content = await popover();
  expect(content.querySelector("input")).toBeNull();
  expect(
    [...content.querySelectorAll<HTMLButtonElement>("button[aria-label]")].map(
      (button) => button.getAttribute("aria-label"),
    ),
  ).toStrictEqual(NOTION_NAMES);
});

test("a Notion color from the fixed toolbar goes out to markdown by its name", async () => {
  const live = await editorWithSelection("simple", "notion");

  await userEvent.click(document.querySelector('[title="Text Color"]')!);
  await userEvent.click(within(await popover()).getByLabelText("Blue"));
  await waitFor(() =>
    expect(markdownOf(live)).toContain('<span color="blue">hot</span>'),
  );

  await userEvent.click(document.querySelector('[title="Highlight Color"]')!);
  await waitFor(() =>
    expect(
      document.querySelectorAll('[data-slot="popover-content"]').length,
    ).toBeGreaterThan(0),
  );
  const highlight = [
    ...document.querySelectorAll<HTMLElement>('[data-slot="popover-content"]'),
  ].find((node) => node.textContent?.includes("No highlight"))!;
  await userEvent.click(within(highlight).getByLabelText("Red"));
  await waitFor(() =>
    expect(markdownOf(live)).toMatch(
      /<span color="blue"><span color="red_bg">hot<\/span><\/span>/,
    ),
  );
});

/**
 * The floating toolbar's backgrounds, in the Notion palette, are its hue at
 * 25% alpha — readable on a dark page, where its light tints were a white
 * box behind light text.
 */
test("with the Notion palette the floating toolbar's backgrounds see through", async () => {
  const live = await editorWithSelection("default", "notion");

  await userEvent.click(
    await waitFor(() => {
      const button = document.querySelector<HTMLElement>(
        'button[aria-label="Text color"]',
      );
      expect(button).not.toBeNull();
      return button!;
    }),
  );
  await userEvent.click(
    await waitFor(() => {
      const item = [
        ...document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
      ].find((node) => node.textContent === "Blue background");
      expect(item).toBeDefined();
      return item!;
    }),
  );

  await waitFor(() =>
    expect(styleOfHot(live)).toContain("rgba(37, 99, 235, 0.25)"),
  );
});

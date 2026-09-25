import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $getRoot } from "lexical";
import { afterEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

import type { PageLinkOption } from "./mentions-plugin";
import { Editor } from "../editor";

// Runs in the `browser` project: the typeahead reads the text before a real
// caret, so "@" has to arrive as a real key press, not a synthetic event.

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

// Unmount, not just clear the DOM: an editor left mounted keeps its typeahead
// listening, and its menu portal steals the next test's key presses.
afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

const PAGES: PageLinkOption[] = [
  {
    url: "/notes/tour-information-1",
    title: "Tour information",
    icon: "🗺️",
    description: "Work",
  },
  { url: "/notes/tokyo-trip-2", title: "Tokyo trip" },
];

async function renderEditor(
  searchPageLinks: (query: string) => Promise<PageLinkOption[]>,
) {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false} searchPageLinks={searchPageLinks}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const editable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  await userEvent.click(editable);

  return editor as unknown as LexicalEditor;
}

function readLinks(editor: LexicalEditor) {
  return editor.getEditorState().read(() =>
    $getRoot()
      .getAllTextNodes()
      .map((text) => text.getParent())
      .filter($isLinkNode)
      .map((link) => ({
        url: link.getURL(),
        rel: link.getRel(),
        text: link.getTextContent(),
      })),
  );
}

test("typing @ and a query lists matching pages under 'Link to page'", async () => {
  const search = vi.fn(async (query: string) =>
    PAGES.filter((page) =>
      page.title.toLowerCase().includes(query.toLowerCase()),
    ),
  );
  await renderEditor(search);

  await userEvent.keyboard("@tour");

  const option = await waitFor(() => {
    const node = [...document.querySelectorAll('[role="option"]')].find(
      (element) => element.textContent?.includes("Tour information"),
    );
    expect(node).toBeDefined();
    return node!;
  });

  expect(document.body.textContent).toContain("Link to page");
  expect(option.textContent).toContain("Work");
  expect(document.body.textContent).not.toContain("Tokyo trip");
  expect(search).toHaveBeenLastCalledWith("tour");
});

test("Enter inserts the page as a mention link in place of the @query", async () => {
  const editor = await renderEditor(async () => PAGES);

  await userEvent.keyboard("See @to");
  await waitFor(() =>
    expect(document.querySelector('[role="option"]')).not.toBeNull(),
  );
  await userEvent.keyboard("{Enter}");

  await waitFor(() =>
    expect(readLinks(editor)).toEqual([
      {
        url: "/notes/tour-information-1",
        rel: "mention",
        text: "🗺️ Tour information",
      },
    ]),
  );
  const text = editor.getEditorState().read(() => $getRoot().getTextContent());
  expect(text).toBe("See 🗺️ Tour information");
});

test("a bare @ asks for recent pages with an empty query", async () => {
  const search = vi.fn(async () => PAGES);
  await renderEditor(search);

  await userEvent.keyboard("@");

  await waitFor(() => expect(search).toHaveBeenCalledWith(""));
  await waitFor(() =>
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(2),
  );
});

test("a page without its own icon gets the default page glyph", async () => {
  const editor = await renderEditor(async () => [PAGES[1]!]);

  await userEvent.keyboard("@tok");
  await waitFor(() =>
    expect(document.querySelector('[role="option"]')).not.toBeNull(),
  );
  await userEvent.keyboard("{Enter}");

  await waitFor(() => expect(readLinks(editor)[0]?.text).toBe("📄 Tokyo trip"));
});

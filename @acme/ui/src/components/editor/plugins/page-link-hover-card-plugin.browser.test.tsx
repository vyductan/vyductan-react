import type { ElementNode, LexicalEditor, TextNode } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

import type { PageLinkPreview } from "./page-link-hover-card-plugin";
import { Editor } from "../editor";
import { $createPageLinkNode } from "../utils/page-link";

// Runs in the `browser` project: hover and caret placement have to be real
// pointer and key input for Lexical and the card's timers to see them.

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

const URL = "/notes/tour-information-1";

const PREVIEW: PageLinkPreview = {
  title: "Tour information",
  icon: "🗺️",
  breadcrumb: "Work / Trips",
  excerpt: "Meet at the station at nine.",
};

async function renderWithPill(
  resolvePageLinkPreview?: (url: string) => Promise<PageLinkPreview | null>,
) {
  let editor: LexicalEditor | null = null;

  render(
    <div>
      <p data-testid="outside">outside</p>
      <Editor autoFocus={false} resolvePageLinkPreview={resolvePageLinkPreview}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    root.append(
      $createParagraphNode().append(
        $createTextNode("See "),
        $createPageLinkNode({
          url: URL,
          title: "Tour information",
          icon: "🗺️",
        }),
        $createTextNode(" later"),
      ),
    );
  });

  const pill = await waitFor(() => {
    const node = document.querySelector<HTMLElement>('a[rel="mention"]');
    expect(node).not.toBeNull();
    return node!;
  });

  return { editor: live, pill };
}

const card = () => document.querySelector('[data-slot="page-link-preview"]');

test("hovering a page link shows its preview card", async () => {
  const resolve = vi.fn(async () => PREVIEW);
  const { pill } = await renderWithPill(resolve);

  await userEvent.hover(pill);

  await waitFor(() => expect(card()).not.toBeNull());
  expect(resolve).toHaveBeenCalledWith(URL);
  expect(card()?.textContent).toContain("Tour information");
  expect(card()?.textContent).toContain("Work / Trips");
  expect(card()?.textContent).toContain("Meet at the station at nine.");
});

test("moving the pointer away closes the card", async () => {
  const { pill } = await renderWithPill(async () => PREVIEW);

  await userEvent.hover(pill);
  await waitFor(() => expect(card()).not.toBeNull());

  await userEvent.hover(document.querySelector('[data-testid="outside"]')!);

  await waitFor(() => expect(card()).toBeNull());
});

test("a second hover over the same link does not ask the host again", async () => {
  const resolve = vi.fn(async () => PREVIEW);
  const { pill } = await renderWithPill(resolve);

  await userEvent.hover(pill);
  await waitFor(() => expect(card()).not.toBeNull());
  await userEvent.hover(document.querySelector('[data-testid="outside"]')!);
  await waitFor(() => expect(card()).toBeNull());
  await userEvent.hover(pill);
  await waitFor(() => expect(card()).not.toBeNull());

  expect(resolve).toHaveBeenCalledTimes(1);
});

test("no card when the host does not know the page", async () => {
  const resolve = vi.fn(async () => null);
  const { pill } = await renderWithPill(resolve);

  await userEvent.hover(pill);
  await waitFor(() => expect(resolve).toHaveBeenCalled());
  await new Promise((resolve) => setTimeout(resolve, 600));

  expect(card()).toBeNull();
});

test("a caret inside a page link does not open the URL editor", async () => {
  const { editor } = await renderWithPill(async () => PREVIEW);

  // Focus first: the URL editor only reacts to a selection the browser holds.
  // Placed through the editor rather than a click, because clicking a link
  // follows it.
  editor.focus();
  await new Promise((resolve) => setTimeout(resolve, 100));
  editor.update(() => {
    const paragraph = $getRoot().getFirstChild();
    const link =
      paragraph && "getChildAtIndex" in paragraph
        ? (paragraph as ElementNode).getChildAtIndex<ElementNode>(1)
        : null;
    link?.getFirstDescendant<TextNode>()?.select(2, 2);
  });
  await new Promise((resolve) => setTimeout(resolve, 600));

  // The URL editor prints the target as text; the pill only carries it in href.
  const printed = [...document.querySelectorAll("a, span, div")].some(
    (element) =>
      element.children.length === 0 && element.textContent?.includes(URL),
  );
  expect(printed).toBe(false);
});

const richContent = JSON.stringify({
  root: {
    type: "root",
    version: 1,
    format: "",
    indent: 0,
    direction: null,
    children: [
      {
        type: "paragraph",
        version: 1,
        format: "",
        indent: 0,
        direction: null,
        children: [
          {
            type: "text",
            version: 1,
            text: "Meet at ",
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
          },
          {
            type: "text",
            version: 1,
            text: "nine",
            format: 1,
            detail: 0,
            mode: "normal",
            style: "",
          },
        ],
      },
    ],
  },
});

test("the icon sits in the title row", async () => {
  const { pill } = await renderWithPill(async () => PREVIEW);

  await userEvent.hover(pill);
  await waitFor(() => expect(card()).not.toBeNull());

  const titleRow = card()?.querySelector(
    '[data-slot="page-link-preview-title"]',
  );
  expect(titleRow?.textContent).toContain("🗺️");
  expect(titleRow?.textContent).toContain("Tour information");
});

test("rich content keeps its formatting", async () => {
  const { pill } = await renderWithPill(async () => ({
    ...PREVIEW,
    excerpt: undefined,
    content: richContent,
  }));

  await userEvent.hover(pill);
  await waitFor(() => expect(card()).not.toBeNull());

  expect(card()?.querySelector("strong")?.textContent).toBe("nine");
  expect(card()?.textContent).toContain("Meet at nine");
});

test("content the renderer refuses falls back to the plain excerpt", async () => {
  const { pill } = await renderWithPill(async () => ({
    ...PREVIEW,
    content: JSON.stringify({
      root: { type: "root", children: [{ type: "mention", text: "x" }] },
    }),
  }));

  await userEvent.hover(pill);
  await waitFor(() => expect(card()).not.toBeNull());

  expect(card()?.textContent).toContain("Meet at the station at nine.");
});

test("holding a modifier key keeps the card open", async () => {
  const { editor, pill } = await renderWithPill(async () => PREVIEW);

  // The key has to land in the editor, where the card listens for typing.
  // A real click on the editor's blank middle (the pill sits at the start of
  // the line) — editor.focus() never moved focus in this harness.
  void editor;
  await userEvent.click(
    document.querySelector<HTMLElement>('[contenteditable="true"]')!,
  );
  await waitFor(() =>
    expect(document.activeElement?.getAttribute("contenteditable")).toBe(
      "true",
    ),
  );
  await userEvent.hover(pill);
  await waitFor(() => expect(card()).not.toBeNull());

  await userEvent.keyboard("{Meta>}");
  await new Promise((resolve) => setTimeout(resolve, 300));
  expect(card()).not.toBeNull();
  await userEvent.keyboard("{/Meta}");

  await userEvent.keyboard("x");
  await waitFor(() => expect(card()).toBeNull());
});

test("a wrapped title flows under the icon rather than beside it", async () => {
  const { pill } = await renderWithPill(async () => PREVIEW);

  await userEvent.hover(pill);
  await waitFor(() => expect(card()).not.toBeNull());

  const titleRow = card()?.querySelector<HTMLElement>(
    '[data-slot="page-link-preview-title"]',
  );
  // A flex row puts the title in its own column, so line two starts under the
  // title's first letter; inline flow starts it under the icon.
  expect(getComputedStyle(titleRow!).display).toBe("block");
});

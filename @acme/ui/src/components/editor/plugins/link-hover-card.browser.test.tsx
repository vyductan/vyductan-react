import type { LexicalEditor, LexicalNode } from "lexical";
import * as React from "react";
import { $createLinkNode, $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
} from "lexical";
import { afterEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";
import { $createPageLinkNode } from "../utils/page-link";

// Runs in the `browser` project: hover has to be real pointer input for the
// card's listeners and timers to see it.

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
  vi.restoreAllMocks();
});

const URL = "https://app.notion.com/p/3f900a0e1d9f81049776c67b1cfda310";

async function renderWithLink() {
  let editor: LexicalEditor | null = null;

  render(
    <div>
      <p data-testid="outside">outside</p>
      <Editor autoFocus={false}>
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
        $createLinkNode(URL).append($createTextNode("the spec")),
        $createTextNode(" later"),
        $createPageLinkNode({ url: "/notes/a", title: "A page" }),
      ),
    );
  });

  const link = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(`a[href="${URL}"]`);
    expect(node).not.toBeNull();
    return node!;
  });

  return { editor: live, link };
}

const card = () =>
  document.querySelector<HTMLElement>('[data-slot="link-hover-card"]');

const openCard = async (link: HTMLElement) => {
  await userEvent.hover(link);
  return waitFor(() => {
    expect(card()).not.toBeNull();
    return card()!;
  });
};

/** The paragraph's inline content: links as `[text](url)`. */
const contentOf = (editor: LexicalEditor) =>
  editor.getEditorState().read(() => {
    const write = (node: LexicalNode): string => {
      if ($isLinkNode(node)) {
        return `[${node.getTextContent()}](${node.getURL()})`;
      }
      if ($isElementNode(node)) return node.getChildren().map(write).join("");
      return node.getTextContent();
    };
    return write($getRoot().getFirstChildOrThrow());
  });

/**
 * As Notion has it: a link shows its card on hover — where it goes, Copy and
 * Edit — not when the caret lands in it. A right-click put the caret there,
 * so the old caret-driven popup opened under the context menu: two popups.
 */
test("hovering a link shows where it goes, Copy and Edit", async () => {
  const { link } = await renderWithLink();

  const shown = await openCard(link);

  expect(shown.textContent).toContain(URL);
  expect(within(shown).getByRole("button", { name: "Copy link" })).toBeTruthy();
  expect(within(shown).getByRole("button", { name: "Edit" })).toBeTruthy();
});

test("the card goes once the pointer leaves the link", async () => {
  const { link } = await renderWithLink();
  await openCard(link);

  await userEvent.hover(document.querySelector('[data-testid="outside"]')!);

  await waitFor(() => expect(card()).toBeNull());
});

test("a caret in a link opens no popup", async () => {
  const { editor } = await renderWithLink();

  editor.update(
    () => {
      $getRoot().getAllTextNodes()[1]!.select(2, 2);
    },
    { discrete: true },
  );
  await new Promise((resolve) => setTimeout(resolve, 500));

  expect(card()).toBeNull();
  expect(document.querySelector('[title="Edit link"]')).toBeNull();
  expect(document.querySelector('[title="Remove link"]')).toBeNull();
});

test("Copy link puts its URL on the clipboard", async () => {
  const writeText = vi
    .spyOn(navigator.clipboard, "writeText")
    .mockResolvedValue();
  const { link } = await renderWithLink();

  await userEvent.click(
    within(await openCard(link)).getByRole("button", { name: "Copy link" }),
  );

  expect(writeText).toHaveBeenCalledWith(URL);
});

test("Edit changes a link's URL and title", async () => {
  const { editor, link } = await renderWithLink();

  await userEvent.click(
    within(await openCard(link)).getByRole("button", { name: "Edit" }),
  );
  const form = card()!;
  const url = within(form).getByLabelText("Page or URL");
  const title = within(form).getByLabelText("Link title");
  expect((url as HTMLInputElement).value).toBe(URL);
  expect((title as HTMLInputElement).value).toBe("the spec");

  await userEvent.clear(url);
  await userEvent.type(url, "https://example.com/b");
  await userEvent.clear(title);
  await userEvent.type(title, "the new spec{Enter}");

  await waitFor(() =>
    expect(contentOf(editor)).toMatch(
      /^See \[the new spec\]\(https:\/\/example\.com\/b\) later\[/,
    ),
  );
  await waitFor(() => expect(card()).toBeNull());
});

test("the edit form stays while the pointer is elsewhere", async () => {
  const { link } = await renderWithLink();
  await userEvent.click(
    within(await openCard(link)).getByRole("button", { name: "Edit" }),
  );

  await userEvent.hover(document.querySelector('[data-testid="outside"]')!);
  await new Promise((resolve) => setTimeout(resolve, 400));

  expect(within(card()!).getByLabelText("Link title")).toBeTruthy();
});

test("Escape closes the edit form, the link as it was", async () => {
  const { editor, link } = await renderWithLink();
  await userEvent.click(
    within(await openCard(link)).getByRole("button", { name: "Edit" }),
  );

  await userEvent.type(
    within(card()!).getByLabelText("Link title"),
    "x{Escape}",
  );

  await waitFor(() => expect(card()).toBeNull());
  expect(contentOf(editor)).toContain(`[the spec](${URL})`);
});

test("Remove link keeps its text", async () => {
  const { editor, link } = await renderWithLink();
  await userEvent.click(
    within(await openCard(link)).getByRole("button", { name: "Edit" }),
  );

  await userEvent.click(
    within(card()!).getByRole("button", { name: "Remove link" }),
  );

  await waitFor(() =>
    expect(contentOf(editor)).toMatch(/^See the spec later\[/),
  );
});

/** A page link has its own preview card; this one is for plain links. */
test("a page link gets no link card", async () => {
  await renderWithLink();

  await userEvent.hover(document.querySelector('a[rel~="mention"]')!);
  await new Promise((resolve) => setTimeout(resolve, 600));

  expect(card()).toBeNull();
});

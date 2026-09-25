import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Real keys and real layout: the bar opens on a shortcut, is placed by
// measuring the editor, and steps through matches on Enter.

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
  document.body.replaceChildren();
  globalThis.scrollTo(0, 0);
  // A modal left behind sets pointer-events: none on the body.
  document.body.removeAttribute("style");
});

const LINES = [
  "Cơ bản về cơ chế",
  "Một dòng không liên quan",
  "Cơ hội cuối cùng",
];

async function openFind() {
  let editor: LexicalEditor | null = null;

  render(
    <div style={{ width: 380, marginLeft: 16 }}>
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
    for (const line of LINES) {
      root.append($createParagraphNode().append($createTextNode(line)));
    }
  });

  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node?.textContent).toContain("Cơ hội");
    return node!;
  });

  await userEvent.click(contentEditable);
  await userEvent.keyboard("{Control>}f{/Control}");

  const input = await waitFor(() => {
    const node = document.querySelector<HTMLInputElement>(
      'input[aria-label="Find in note"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  return { live, contentEditable, input };
}

const counter = () =>
  document.querySelector('[data-slot="find-count"]')?.textContent ?? "";

/**
 * The bar used to open as a modal dialog in the middle of the screen, which
 * covered the very text being searched and blocked the page behind it.
 */
test("opens as a bar, not a dialog, and takes the caret", async () => {
  const { input } = await openFind();

  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(input);
});

test("sits at the top right of the editor", async () => {
  const { contentEditable } = await openFind();

  const bar = document.querySelector<HTMLElement>('[data-slot="find-bar"]')!;
  const box = bar.getBoundingClientRect();
  const editorBox = contentEditable.getBoundingClientRect();

  expect(Math.abs(box.right - editorBox.right)).toBeLessThan(24);
  expect(box.top).toBeGreaterThanOrEqual(0);
  expect(box.top).toBeLessThan(editorBox.top + 40);
});

test("counts matches without regard to case, and steps with Enter", async () => {
  const { input } = await openFind();

  // Two in the first line — "Cơ" and "cơ" — and one in the last.
  await userEvent.fill(input, "cơ");
  await waitFor(() => expect(counter()).toBe("1 of 3"));

  await userEvent.keyboard("{Enter}");
  expect(counter()).toBe("2 of 3");

  // Back past the first wraps round to the last.
  await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
  await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
  expect(counter()).toBe("3 of 3");
});

test("closes on Escape and gives the caret back to the note", async () => {
  const { input, contentEditable } = await openFind();

  await userEvent.fill(input, "cơ");
  await userEvent.keyboard("{Escape}");

  await waitFor(() =>
    expect(document.querySelector('[data-slot="find-bar"]')).toBeNull(),
  );
  expect(
    contentEditable.contains(document.activeElement) ||
      document.activeElement === contentEditable,
  ).toBe(true);
});

/**
 * Two matches in one line: replacing the first shifts the second, and the
 * old code kept the stale offset and replaced the wrong characters.
 */
test("replaces one match, then all of the rest, in place", async () => {
  const { input, live } = await openFind();

  await userEvent.fill(input, "cơ");
  await waitFor(() => expect(counter()).toBe("1 of 3"));

  await userEvent.click(
    document.querySelector<HTMLButtonElement>(
      'button[aria-label="Show replace"]',
    )!,
  );
  const replaceInput = document.querySelector<HTMLInputElement>(
    'input[aria-label="Replace with"]',
  )!;
  await userEvent.fill(replaceInput, "XY");

  await userEvent.click(
    [...document.querySelectorAll("button")].find(
      (node) => node.textContent?.trim() === "Replace",
    )!,
  );

  const text = () =>
    live.getEditorState().read(() => $getRoot().getTextContent());
  await waitFor(() => expect(text()).toContain("XY bản về cơ chế"));
  await waitFor(() => expect(counter()).toBe("1 of 2"));

  await userEvent.click(
    [...document.querySelectorAll("button")].find(
      (node) => node.textContent?.trim() === "Replace all",
    )!,
  );

  await waitFor(() =>
    expect(text()).toBe(
      ["XY bản về XY chế", "Một dòng không liên quan", "XY hội cuối cùng"].join(
        "\n\n",
      ),
    ),
  );
});

/**
 * Formatted text is wrapped in more elements — inline code in <code><span>,
 * bold in <strong> — so the text is not the element's first child. Those
 * matches were counted but never painted.
 */
test("highlights a match inside formatted text too", async () => {
  let editor: LexicalEditor | null = null;

  render(
    <div style={{ width: 380, marginLeft: 16 }}>
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
        $createTextNode("plain email, "),
        $createTextNode("code email").toggleFormat("code"),
        $createTextNode(" and "),
        $createTextNode("bold email").toggleFormat("bold"),
      ),
    );
  });

  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node?.textContent).toContain("bold email");
    return node!;
  });

  await userEvent.click(contentEditable);
  await userEvent.keyboard("{Control>}f{/Control}");
  const input = await waitFor(() => {
    const node = document.querySelector<HTMLInputElement>(
      'input[aria-label="Find in note"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  await userEvent.fill(input, "email");
  await waitFor(() => expect(counter()).toBe("1 of 3"));

  const highlights = (
    globalThis.CSS as unknown as { highlights: Map<string, Set<Range>> }
  ).highlights;
  await waitFor(() => expect(highlights.get("editor-find")?.size).toBe(3));

  const painted = [...highlights.get("editor-find")!].map((range) =>
    range.toString(),
  );
  expect(painted).toStrictEqual(["email", "email", "email"]);
});

/**
 * A page that scrolls under a sticky header. The bar was kept below the
 * nearest scroll container's top, which here is the top of the viewport, so
 * once the note was scrolled it rode up into the header and out of the
 * editor. Whatever sits over the spot it would take, it goes below.
 */
async function openFindUnderStickyHeader(scrollsInside: boolean) {
  let editor: LexicalEditor | null = null;

  const header = (
    <header
      data-testid="sticky-header"
      style={{
        position: "sticky",
        top: 0,
        height: 64,
        background: "white",
        zIndex: 10,
      }}
    />
  );
  const body = (
    <div style={{ width: 380, marginLeft: 16 }}>
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>
  );

  render(
    scrollsInside ? (
      <div data-testid="scroller" style={{ height: 600, overflowY: "auto" }}>
        {header}
        {body}
      </div>
    ) : (
      <div>
        {header}
        {body}
      </div>
    ),
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    for (let line = 0; line < 80; line++) {
      root.append(
        $createParagraphNode().append($createTextNode(`Line ${line} cơ bản`)),
      );
    }
  });

  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node?.textContent).toContain("Line 79");
    return node!;
  });

  await userEvent.click(contentEditable);

  // Scroll well past the top of the note.
  if (scrollsInside) {
    document.querySelector<HTMLElement>('[data-testid="scroller"]')!.scrollTop =
      900;
  } else {
    globalThis.scrollTo(0, 900);
  }
  await new Promise((resolve) => setTimeout(resolve, 50));

  await userEvent.keyboard("{Control>}f{/Control}");
  const bar = await waitFor(() => {
    const node = document.querySelector<HTMLElement>('[data-slot="find-bar"]');
    expect(node).not.toBeNull();
    return node!;
  });

  return {
    bar,
    header: document.querySelector<HTMLElement>(
      '[data-testid="sticky-header"]',
    )!,
    contentEditable,
  };
}

test.each([
  ["a scroll container", true],
  ["the page itself", false],
])(
  "stays below a sticky header when %s scrolls",
  async (_name, scrollsInside) => {
    const { bar, header, contentEditable } =
      await openFindUnderStickyHeader(scrollsInside);

    const barBox = bar.getBoundingClientRect();
    const headerBox = header.getBoundingClientRect();

    // The note really has scrolled up under the header.
    expect(contentEditable.getBoundingClientRect().top).toBeLessThan(
      headerBox.bottom,
    );
    expect(barBox.top).toBeGreaterThanOrEqual(headerBox.bottom);
    expect(barBox.top).toBeLessThan(headerBox.bottom + 24);
  },
);

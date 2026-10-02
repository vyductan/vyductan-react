import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $getClipboardDataFromSelection } from "@lexical/clipboard";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

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

async function emptyEditor(
  props: { readClipboardText?: () => Promise<string> } = {},
) {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false} resolvePasteLink={async () => null} {...props}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  const root = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  root.focus();
  live.update(
    () => {
      const paragraph = $createParagraphNode();
      $getRoot().clear().append(paragraph);
      paragraph.select();
    },
    { discrete: true },
  );
  return { live, root };
}

const paste = (root: HTMLElement, flavours: Record<string, string>) => {
  const clipboardData = new DataTransfer();
  for (const [type, value] of Object.entries(flavours)) {
    clipboardData.setData(type, value);
  }
  root.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );
};

/** Inline colors, backgrounds and fonts, anywhere in the editor. */
const styledElements = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>("[style]")].filter((element) =>
    /color|font-family|font-size/.test(element.getAttribute("style") ?? ""),
  );

/**
 * Copied from a web page: the email in an account menu, grey on white. The
 * page's colors came along — a white box on the dark editor — and in
 * markdown they could not even be saved: shown, then gone on reopening.
 * What is kept is what means something: bold, code, links.
 */
test("pasted HTML keeps its formatting, not its colors and fonts", async () => {
  const { root } = await emptyEditor();

  paste(root, {
    "text/html":
      '<meta charset="utf-8"><span style="color: rgb(117, 117, 117); background-color: rgb(255, 255, 255); font-family: Inter; font-size: 14px;">operator.local@example.com</span> <b style="color: red">bold</b> <code style="background: #eee">code</code>',
    "text/plain": "operator.local@example.com bold code",
  });

  await waitFor(() =>
    expect(root.textContent).toBe("operator.local@example.com bold code"),
  );
  expect(styledElements(root)).toStrictEqual([]);
  expect(root.querySelector("strong, b")?.textContent).toBe("bold");
  expect(root.querySelector("code")?.textContent).toBe("code");
});

/** The editor's own text colors (the toolbar's) are kept on its own copy. */
test("a copy from the editor itself keeps its text colors", async () => {
  const { live, root } = await emptyEditor();
  let clipboard: Record<string, string> = {};
  live.update(
    () => {
      const red = $createTextNode("red").setStyle("color: #e03e3e");
      const paragraph = $createParagraphNode().append(red);
      $getRoot().clear().append(paragraph, $createParagraphNode());
      red.select(0, 3);
      clipboard = $getClipboardDataFromSelection() as Record<string, string>;
      $getRoot()
        .getLastChildOrThrow<ReturnType<typeof $createParagraphNode>>()
        .select();
    },
    { discrete: true },
  );
  expect(clipboard["application/x-lexical-editor"]).toBeDefined();

  paste(root, clipboard);

  await waitFor(() =>
    expect(
      [...root.querySelectorAll<HTMLElement>("span")].filter(
        (span) =>
          span.textContent === "red" && span.style.color === "rgb(224, 62, 62)",
      ),
    ).toHaveLength(2),
  );
});

/** What VS Code puts on the clipboard for a copy from a text editor. */
const fromVsCode = (mode: string, text: string, html: string) => ({
  "vscode-editor-data": JSON.stringify({
    version: 1,
    isFromEmptySelection: false,
    multicursorText: null,
    mode,
  }),
  "text/html": `<meta charset="utf-8"><div style="color: #cccccc;background-color: #1f1f1f;font-family: Menlo, Monaco, 'Courier New', monospace;font-size: 12px;white-space: pre;"><div>${html}</div></div>`,
  "text/plain": text,
});

/**
 * Copied from a .env file in VS Code: its HTML is the syntax highlighting —
 * a lavender variable name pasted as lavender text. It is source, so it
 * goes in as the plain text it is.
 */
test("a copy from a VS Code text editor goes in as its plain text", async () => {
  const { root } = await emptyEditor();

  paste(
    root,
    fromVsCode(
      "dotenv",
      "STRIPE_WEBHOOK_SECRET",
      '<span style="color: #9cdcfe;">STRIPE_WEBHOOK_SECRET</span>',
    ),
  );

  await waitFor(() => expect(root.textContent).toBe("STRIPE_WEBHOOK_SECRET"));
  expect(styledElements(root)).toStrictEqual([]);
});

/** As plain text, not read as markdown: a .env comment is no heading. */
test("a copy from a VS Code text editor is not read as markdown", async () => {
  const { root } = await emptyEditor();

  paste(
    root,
    fromVsCode(
      "dotenv",
      "# local only",
      '<span style="color: #6a9955;"># local only</span>',
    ),
  );

  await waitFor(() => expect(root.textContent).toBe("# local only"));
  expect(root.querySelector("h1")).toBeNull();
});

/** Unless it is markdown: copied from a .md file, it is read as markdown. */
test("a copy from a markdown file in VS Code is read as markdown", async () => {
  const { root } = await emptyEditor();

  paste(
    root,
    fromVsCode(
      "markdown",
      "# Title\n\n**bold**",
      '<span style="color: #569cd6;"># Title</span></div><div><br></div><div><span style="color: #569cd6;">**bold**</span>',
    ),
  );

  await waitFor(() =>
    expect(root.querySelector("h1")?.textContent).toBe("Title"),
  );
  expect(root.querySelector("strong, b")?.textContent).toBe("bold");
  expect(styledElements(root)).toStrictEqual([]);
});

/**
 * Cmd+Shift+V pastes without formatting, as in Notion: the clipboard's
 * plain text, as it is — not read as markdown. In VS Code the shortcut is
 * "Open Markdown Preview", so the editor keeps the keystroke to itself.
 */
test("Cmd+Shift+V pastes the clipboard's plain text as it is", async () => {
  const reached: KeyboardEvent[] = [];
  const onWindowKeyDown = (event: KeyboardEvent) => {
    if (event.code === "KeyV") reached.push(event);
  };
  window.addEventListener("keydown", onWindowKeyDown);
  try {
    const { root } = await emptyEditor({
      readClipboardText: async () => "**plain** text",
    });

    await userEvent.keyboard("{Meta>}{Shift>}v{/Shift}{/Meta}");

    await waitFor(() => expect(root.textContent).toBe("**plain** text"));
    expect(root.querySelector("strong, b")).toBeNull();
    expect(reached).toStrictEqual([]);
  } finally {
    window.removeEventListener("keydown", onWindowKeyDown);
  }
});

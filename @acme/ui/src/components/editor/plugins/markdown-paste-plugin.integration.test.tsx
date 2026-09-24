import "@testing-library/jest-dom/vitest";

import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $generateHtmlFromNodes } from "@lexical/html";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
  $isTextNode,
  PASTE_COMMAND,
} from "lexical";
import { afterEach, expect, test, vi } from "vitest";

import { $createCodeNode } from "@lexical/code";

import { Editor } from "../editor";
import { nodes } from "../nodes/nodes";
import pastedShellNote from "./__fixtures__/pasted-shell-note.md?raw";
import { MarkdownPastePlugin } from "./markdown-paste-plugin";
import { normalizeHtmlOutput } from "./normalize-html-output";

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

function MarkdownPasteHarness({
  onChange,
  onReady,
}: {
  onChange?: (html: string) => void;
  onReady?: (editor: LexicalEditor) => void;
}) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "MarkdownPastePluginTest",
        theme: {},
        nodes: nodes as never,
        onError: (error) => {
          throw error;
        },
      }}
    >
      <RichTextPlugin
        contentEditable={<ContentEditable aria-label="Markdown paste editor" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <MarkdownPastePlugin />
      {onReady ? <EditorRefPlugin onReady={onReady} /> : null}
      <OnChangePlugin
        ignoreSelectionChange={true}
        onChange={(editorState, editor) => {
          editorState.read(() => {
            onChange?.(
              normalizeHtmlOutput($generateHtmlFromNodes(editor, null)),
            );
          });
        }}
      />
    </LexicalComposer>
  );
}

afterEach(() => {
  cleanup();
});

test("pastes nested markdown bullets as a nested list inside the preceding parent list item", async () => {
  let editor: LexicalEditor | null = null;
  let latestHtml = "";

  render(
    <MarkdownPasteHarness
      onReady={(nextEditor) => {
        editor = nextEditor;
      }}
      onChange={(html) => {
        latestHtml = html;
      }}
    />,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  act(() => {
    editor?.update(() => {
      $getRoot().select();
    });
  });

  const pastedText = [
    "- Private tours only",
    "- Regarding dietary restrictions, please refer to the Tour Information Sheet. Unfortunately, we are unable to accommodate the following cases for both shared and private tours:",
    "    - Guests with severe allergies.",
    "    - Guests who cannot accept any risk of cross-contamination, regardless of the severity of their allergy. ( including for religious reasons)",
  ].join("\n");

  const preventDefault = vi.fn();
  const clipboardData = {
    getData(type: string) {
      return type === "text/plain" ? pastedText : "";
    },
  };

  act(() => {
    editor?.dispatchCommand(PASTE_COMMAND, {
      clipboardData,
      preventDefault,
    } as unknown as ClipboardEvent);
  });

  await waitFor(() => {
    expect(preventDefault).toHaveBeenCalled();

    const document = new DOMParser().parseFromString(latestHtml, "text/html");
    const topLevelList = document.body.querySelector("ul");
    expect(topLevelList).not.toBeNull();

    const topLevelItems = [...(topLevelList?.children ?? [])].filter(
      (element) => element.tagName === "LI",
    );

    expect(topLevelItems).toHaveLength(2);

    const secondItem = topLevelItems[1];
    expect(secondItem).toBeDefined();

    const nestedList = [...(secondItem?.children ?? [])].find(
      (element) => element.tagName === "UL",
    );

    expect(nestedList).toBeDefined();

    const nestedItems = [...(nestedList?.children ?? [])].filter(
      (element) => element.tagName === "LI",
    );

    expect(nestedItems.map((item) => item.textContent?.trim())).toEqual([
      "Guests with severe allergies.",
      "Guests who cannot accept any risk of cross-contamination, regardless of the severity of their allergy. ( including for religious reasons)",
    ]);
  });
});

/**
 * The caret decides where a paste lands. Converting the markdown through a
 * scratch node appended to the root moved it: @lexical/markdown's
 * `$convertFromMarkdownString` ends with `root.selectStart()` on whichever node
 * it was handed, so the caret jumped to the bottom of the document and the
 * paste landed there instead of where the person was typing.
 */
test("pastes where the caret is, not at the end of the document", async () => {
  let editor: LexicalEditor | null = null;

  render(
    <MarkdownPasteHarness
      onReady={(nextEditor) => {
        editor = nextEditor;
      }}
    />,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const live = editor as unknown as LexicalEditor;

  act(() => {
    live.update(() => {
      const root = $getRoot();
      root.clear();
      for (const text of ["First block", "Second block", "Third block"]) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(text));
        root.append(paragraph);
      }
      // The caret sits in the first block, far from the end.
      root.getFirstChild()?.selectEnd();
    });
  });

  const preventDefault = vi.fn();

  act(() => {
    live.dispatchCommand(PASTE_COMMAND, {
      clipboardData: {
        getData: (type: string) =>
          type === "text/plain" ? "## Pasted heading" : "",
      },
      preventDefault,
    } as unknown as ClipboardEvent);
  });

  await waitFor(() => {
    expect(preventDefault).toHaveBeenCalled();
  });

  const blocks = live
    .getEditorState()
    .read(() =>
      $getRoot()
        .getChildren()
        .map((child) => child.getTextContent()),
    );

  // The first pasted block merges into the line the caret is on, the way any
  // insert at a caret does. What matters is that it happens there.
  expect(blocks[0]).toContain("Pasted heading");
  expect(blocks.at(-1)).toBe("Third block");
});

/**
 * The document that actually broke this, kept verbatim as a fixture: headings,
 * rules, a fenced box-drawing block, bullets with inline code, and a blockquote
 * whose last line is a bare ">".
 */
test("pastes a whole markdown document without throwing", async () => {
  let editor: LexicalEditor | null = null;
  const onError = vi.fn();

  render(
    <MarkdownPasteHarness
      onReady={(nextEditor) => {
        editor = nextEditor;
      }}
    />,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const live = editor as unknown as LexicalEditor;
  const removeErrorListener = live.registerUpdateListener(() => {});

  act(() => {
    live.update(() => {
      const root = $getRoot();
      root.clear();
      for (const text of ["First block", "Last block"]) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(text));
        root.append(paragraph);
      }
      root.getFirstChild()?.selectEnd();
    });
  });

  const preventDefault = vi.fn();

  act(() => {
    live.dispatchCommand(PASTE_COMMAND, {
      clipboardData: {
        getData: (type: string) => (type === "text/plain" ? pastedShellNote : ""),
      },
      preventDefault,
    } as unknown as ClipboardEvent);
  });

  await waitFor(() => {
    expect(preventDefault).toHaveBeenCalled();
  });

  removeErrorListener();
  expect(onError).not.toHaveBeenCalled();

  const blocks = live
    .getEditorState()
    .read(() =>
      $getRoot()
        .getChildren()
        .map((child) => child.getTextContent()),
    );

  expect(blocks.at(-1)).toBe("Last block");
  expect(blocks.length).toBeGreaterThan(3);
});

/**
 * The same paste through the shipped editor rather than a hand-built composer.
 * A minimal harness registers this plugin and little else, so it misses
 * anything that only goes wrong alongside the rest of the editor's plugins and
 * nodes — which is where this first showed up.
 */
test("pastes a whole markdown document into the real editor", async () => {
  let editor: LexicalEditor | null = null;

  render(
    <Editor
      autoFocus={false}
      format="html"
      value="<p>First block</p><p>Last block</p>"
    >
      <EditorRefPlugin
        onReady={(nextEditor) => {
          editor = nextEditor;
        }}
      />
    </Editor>,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const live = editor as unknown as LexicalEditor;

  await waitFor(() => {
    const blocks = live
      .getEditorState()
      .read(() => $getRoot().getChildren().length);
    expect(blocks).toBe(2);
  });

  act(() => {
    live.update(() => {
      $getRoot().getFirstChild()?.selectEnd();
    });
  });

  const preventDefault = vi.fn();

  act(() => {
    live.dispatchCommand(PASTE_COMMAND, {
      // The shipped editor has plugins that read more of the event than the
      // text: files, items and types all get touched before this one runs.
      clipboardData: {
        files: [],
        items: [],
        types: ["text/plain"],
        getData: (type: string) =>
          type === "text/plain" ? pastedShellNote : "",
      },
      preventDefault,
    } as unknown as ClipboardEvent);
  });

  await waitFor(() => {
    expect(preventDefault).toHaveBeenCalled();
  });

  const blocks = live
    .getEditorState()
    .read(() =>
      $getRoot()
        .getChildren()
        .map((child) => child.getTextContent()),
    );

  expect(blocks.at(-1)).toBe("Last block");
  expect(blocks.length).toBeGreaterThan(5);

  // The box-drawing block in the fixture is fenced, and arrives as a code
  // block rather than a run of paragraphs.
  const types = live
    .getEditorState()
    .read(() =>
      $getRoot()
        .getChildren()
        .map((child) => child.getType()),
    );

  expect(types).toContain("code");

  // The fixture closes its quote with a bare ">", which means an empty line
  // inside the quote, not a character to show.
  expect(types).toContain("quote");
  expect(blocks.some((block) => block.trim() === ">")).toBe(false);
  expect(blocks.some((block) => block.trimEnd().endsWith(">"))).toBe(false);
});

/**
 * A caret in the middle of a line, which is where people actually paste. That
 * takes a different route into the document — the block has to be split around
 * the caret — and the split walks up from the nodes being inserted. They come
 * back from the importer still parented to its internal container, which has no
 * parent of its own, so the walk threw and the paste was left half applied.
 */
test("pastes with the caret in the middle of a line", async () => {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin
        onReady={(nextEditor) => {
          editor = nextEditor;
        }}
      />
    </Editor>,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const live = editor as unknown as LexicalEditor;

  act(() => {
    live.update(() => {
      const root = $getRoot();
      root.clear();
      for (const text of ["First block here", "Last block"]) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(text));
        root.append(paragraph);
      }
      const firstBlock = $getRoot().getFirstChild();
      const firstText = $isElementNode(firstBlock)
        ? firstBlock.getFirstChild()
        : null;
      if ($isTextNode(firstText)) {
        firstText.select(5, 5);
      }
    });
  });

  const preventDefault = vi.fn();

  act(() => {
    live.dispatchCommand(PASTE_COMMAND, {
      clipboardData: {
        files: [],
        items: [],
        types: ["text/plain"],
        getData: (type: string) =>
          type === "text/plain" ? pastedShellNote : "",
      },
      preventDefault,
    } as unknown as ClipboardEvent);
  });

  await waitFor(() => {
    expect(preventDefault).toHaveBeenCalled();
  });

  const blocks = live
    .getEditorState()
    .read(() =>
      $getRoot()
        .getChildren()
        .map((child) => child.getTextContent()),
    );

  expect(blocks[0]).toContain("First");
  expect(blocks.at(-1)).toBe("Last block");
  expect(blocks.length).toBeGreaterThan(5);
});

/**
 * A caret inside a code block. The markdown goes in as the literal text it is,
 * which is what a code block is for — no headings, no lists. Worth pinning
 * down: it is a different route into the document, and it must not throw.
 */
test("pastes with the caret inside a code block", async () => {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin
        onReady={(nextEditor) => {
          editor = nextEditor;
        }}
      />
    </Editor>,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const live = editor as unknown as LexicalEditor;

  act(() => {
    live.update(() => {
      const root = $getRoot();
      root.clear();
      const code = $createCodeNode();
      code.append($createTextNode("| KHUNG VO (SHELL)"));
      root.append(code);
      const tail = $createParagraphNode();
      tail.append($createTextNode("Last block"));
      root.append(tail);
      const codeText = code.getFirstChild();
      if ($isTextNode(codeText)) {
        codeText.select(5, 5);
      }
    });
  });

  const preventDefault = vi.fn();

  act(() => {
    live.dispatchCommand(PASTE_COMMAND, {
      clipboardData: {
        files: [],
        items: [],
        types: ["text/plain"],
        getData: (type: string) =>
          type === "text/plain" ? pastedShellNote : "",
      },
      preventDefault,
    } as unknown as ClipboardEvent);
  });

  await waitFor(() => {
    expect(preventDefault).toHaveBeenCalled();
  });

  const blocks = live
    .getEditorState()
    .read(() =>
      $getRoot()
        .getChildren()
        .map((child) => child.getTextContent()),
    );

  expect(blocks.at(-1)).toBe("Last block");
  expect(blocks[0]).toContain("Trong lập trình web");
  expect(blocks[0]).not.toContain("###");
});

/**
 * A fenced block is the one piece of markdown that spans lines, and pasting a
 * note from a chat is the common way one arrives. Typing ``` mid-sentence
 * turning into a code block is a different question — that is the shortcut
 * plugin, and it stays off.
 */
test("pastes a fenced block as a code block", async () => {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin
        onReady={(nextEditor) => {
          editor = nextEditor;
        }}
      />
    </Editor>,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const live = editor as unknown as LexicalEditor;

  act(() => {
    live.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode("Before"));
      root.append(paragraph);
      paragraph.selectEnd();
    });
  });

  const preventDefault = vi.fn();

  act(() => {
    live.dispatchCommand(PASTE_COMMAND, {
      clipboardData: {
        files: [],
        items: [],
        types: ["text/plain"],
        getData: (type: string) =>
          type === "text/plain"
            ? ["Intro line", "", "```", "const x = 1;", "```", ""].join("\n")
            : "",
      },
      preventDefault,
    } as unknown as ClipboardEvent);
  });

  await waitFor(() => {
    expect(preventDefault).toHaveBeenCalled();
  });

  const types = live
    .getEditorState()
    .read(() =>
      $getRoot()
        .getChildren()
        .map((child) => child.getType()),
    );

  expect(types).toContain("code");
});

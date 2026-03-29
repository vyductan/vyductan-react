import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";

Object.assign(globalThis, { React });
import { afterEach, expect, test, vi } from "vitest";
import { $generateHtmlFromNodes } from "@lexical/html";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import type { LexicalEditor } from "lexical";
import { $getRoot, PASTE_COMMAND } from "lexical";

import { nodes } from "../nodes/nodes";
import { MarkdownPastePlugin } from "./markdown-paste-plugin";
import { normalizeHtmlOutput } from "./normalize-html-output";

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
            onChange?.(normalizeHtmlOutput($generateHtmlFromNodes(editor, null)));
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
    editor?.dispatchCommand(
      PASTE_COMMAND,
      { clipboardData, preventDefault } as unknown as ClipboardEvent,
    );
  });

  await waitFor(() => {
    expect(preventDefault).toHaveBeenCalled();

    const document = new DOMParser().parseFromString(latestHtml, "text/html");
    const topLevelList = document.body.querySelector("ul");
    expect(topLevelList).not.toBeNull();

    const topLevelItems = Array.from(topLevelList?.children ?? []).filter(
      (element) => element.tagName === "LI",
    );

    expect(topLevelItems).toHaveLength(2);

    const secondItem = topLevelItems[1];
    expect(secondItem).toBeDefined();

    const nestedList = Array.from(secondItem?.children ?? []).find(
      (element) => element.tagName === "UL",
    );

    expect(nestedList).toBeDefined();

    const nestedItems = Array.from(nestedList?.children ?? []).filter(
      (element) => element.tagName === "LI",
    );

    expect(nestedItems.map((item) => item.textContent?.trim())).toEqual([
      "Guests with severe allergies.",
      "Guests who cannot accept any risk of cross-contamination, regardless of the severity of their allergy. ( including for religious reasons)",
    ]);
  });
});

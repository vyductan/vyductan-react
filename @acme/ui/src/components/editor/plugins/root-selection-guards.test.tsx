import "@testing-library/jest-dom/vitest";

import type { LexicalEditor } from "lexical";
import * as React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";

import { FloatingLinkContext } from "../context/floating-link-context";
import { nodes } from "../nodes/nodes";
import { BlockCopyPastePlugin } from "./block-copy-paste-plugin";
import { CheckBlockPlugin } from "./check-block-plugin";
import { FloatingTextFormatToolbarPlugin } from "./floating-text-format-toolbar-plugin";

Object.assign(globalThis, { React });

// jsdom ships neither, and the copy/paste plugin compares events against both.
for (const name of ["DragEvent", "ClipboardEvent"]) {
  if (!(name in globalThis)) {
    Object.assign(globalThis, { [name]: class extends MouseEvent {} });
  }
}

// Nor execCommand. A copy/cut event that is not a real ClipboardEvent sends
// Lexical down its fallback, `document.execCommand("copy")`, and without this
// the test passes while an unhandled rejection fails the run.
if (typeof document.execCommand !== "function") {
  Object.assign(document, { execCommand: () => false });
}

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

function GuardHarness({
  onReady,
}: {
  onReady: (editor: LexicalEditor) => void;
}) {
  const [anchor, setAnchor] = React.useState<HTMLDivElement | null>(null);

  return (
    <LexicalComposer
      initialConfig={{
        namespace: "RootSelectionGuardsTest",
        theme: {},
        nodes: nodes as never,
        onError: (error) => {
          throw error;
        },
      }}
    >
      <FloatingLinkContext>
        <RichTextPlugin
          contentEditable={
            <div ref={setAnchor}>
              <ContentEditable aria-label="Guarded editor" />
            </div>
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <CheckBlockPlugin />
        <BlockCopyPastePlugin />
        <FloatingTextFormatToolbarPlugin anchorElem={anchor} />
        <EditorRefPlugin onReady={onReady} />
      </FloatingLinkContext>
    </LexicalComposer>
  );
}

/**
 * Puts the caret where an empty editor puts it: on the ROOT itself, with no
 * block under it. Every handler below then asks that node which block it
 * belongs to, and a root has no answer.
 */
async function mountWithRootSelection() {
  let editor: LexicalEditor | null = null;

  const { container } = render(
    <GuardHarness onReady={(next) => (editor = next)} />,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const readyEditor = editor as unknown as LexicalEditor;

  act(() => {
    readyEditor.update(
      () => {
        const root = $getRoot();
        root.clear();
        root.select();
      },
      { discrete: true },
    );
  });

  const editable = container.querySelector('[contenteditable="true"]');
  if (!editable) throw new Error("harness has no editable");

  return { editor: readyEditor, editable: editable as HTMLElement };
}

/**
 * A listener that throws does not propagate out of dispatchEvent — jsdom
 * reports it on window instead, so that is what gets watched.
 */
async function errorsWhile(action: () => void): Promise<string[]> {
  const errors: string[] = [];
  const onError = (event: ErrorEvent) => errors.push(event.message);
  window.addEventListener("error", onError);

  await act(async () => {
    action();
    await Promise.resolve();
  });

  window.removeEventListener("error", onError);
  return errors;
}

afterEach(() => {
  cleanup();
});

test.each([
  ["Enter", "Enter"],
  ["Tab", "Tab"],
  ["Backspace", "Backspace"],
])("%s in an empty editor does not throw", async (_name, key) => {
  const { editable } = await mountWithRootSelection();

  const errors = await errorsWhile(() => {
    fireEvent.keyDown(editable, { key });
  });

  expect(errors).toEqual([]);
});

// The paste handler only engages for HTML this editor copied, so the payload
// has to carry that marker or the test never reaches the code it is guarding.
const BLOCK_COPY_HTML =
  '<div data-lexical-block-copy="true"><p>A copied block</p></div>';

test.each([["copy"], ["cut"], ["paste"]])(
  "%s in an empty editor does not throw",
  async (type) => {
    const { editable } = await mountWithRootSelection();

    const errors = await errorsWhile(() => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperty(event, "clipboardData", {
        value: {
          getData: (format: string) =>
            format === "text/html" ? BLOCK_COPY_HTML : "",
          setData: () => undefined,
        },
      });
      editable.dispatchEvent(event);
    });

    expect(errors).toEqual([]);
  },
);

test("a selection change in an empty editor does not throw", async () => {
  const { editor } = await mountWithRootSelection();

  const errors = await errorsWhile(() => {
    editor.update(
      () => {
        $getRoot().select();
      },
      { discrete: true },
    );
  });

  expect(errors).toEqual([]);
});

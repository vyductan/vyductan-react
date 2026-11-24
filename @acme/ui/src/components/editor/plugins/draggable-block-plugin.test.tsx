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
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
} from "lexical";
import { afterEach, expect, test } from "vitest";

import { nodes } from "../nodes/nodes";
import { DraggableBlockPlugin } from "./draggable-block-plugin";

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

/**
 * Mirrors how the editor mounts this plugin: the anchor is the element wrapping
 * the contenteditable, so a pointer over the editor's own padding raises a
 * mousemove whose target is the contenteditable itself.
 */
function DraggableHarness({
  onReady,
}: {
  onReady: (editor: LexicalEditor) => void;
}) {
  const [anchor, setAnchor] = React.useState<HTMLDivElement | null>(null);

  return (
    <LexicalComposer
      initialConfig={{
        namespace: "DraggableBlockPluginTest",
        theme: {},
        nodes: nodes as never,
        onError: (error) => {
          throw error;
        },
      }}
    >
      <RichTextPlugin
        contentEditable={
          <div data-testid="anchor" ref={setAnchor}>
            <ContentEditable aria-label="Draggable editor" />
          </div>
        }
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <DraggableBlockPlugin anchorElem={anchor} />
      <EditorRefPlugin onReady={onReady} />
    </LexicalComposer>
  );
}

async function mountHarness() {
  let editor: LexicalEditor | null = null;

  const { container } = render(
    <DraggableHarness onReady={(next) => (editor = next)} />,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  return { editor: editor as unknown as LexicalEditor, container };
}

afterEach(() => {
  cleanup();
});

test("hovering the editor's own padding does not throw", async () => {
  const { editor, container } = await mountHarness();

  act(() => {
    editor.update(() => {
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode("A block"));
      $getRoot().append(paragraph);
    });
  });

  const editable = container.querySelector('[contenteditable="true"]');
  expect(editable).not.toBeNull();

  // A listener that throws does not propagate out of dispatchEvent — jsdom
  // reports it on window instead, which is why this is caught here rather than
  // with expect(...).not.toThrow().
  const errors: string[] = [];
  const onError = (event: ErrorEvent) => errors.push(event.message);
  window.addEventListener("error", onError);

  act(() => {
    fireEvent.mouseMove(editable as HTMLElement);
  });

  window.removeEventListener("error", onError);

  expect(errors).toEqual([]);
});

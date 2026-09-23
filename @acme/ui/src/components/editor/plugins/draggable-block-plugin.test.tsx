import "@testing-library/jest-dom/vitest";

import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
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
  $getNodeByKey,
  $getRoot,
} from "lexical";
import { afterEach, expect, test } from "vitest";

import { nodes } from "../nodes/nodes";
import {
  $draggableBlockForNode,
  DraggableBlockPlugin,
} from "./draggable-block-plugin";

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

/**
 * Which block the drag handle should attach to. The root is the case that
 * crashed: a pointer over the editor's padding resolves to it, and a root has
 * no top-level element by definition.
 */
test("resolves the block a hovered node belongs to, and nothing for the root", async () => {
  const { editor } = await mountHarness();

  const keys = {
    paragraph: "",
    paragraphText: "",
    list: "",
    item: "",
    itemText: "",
  };

  act(() => {
    editor.update(
      () => {
        const root = $getRoot();
        // The initial state already holds an empty paragraph; clearing keeps the
        // keys below unambiguous.
        root.clear();

        const paragraphText = $createTextNode("A paragraph");
        const paragraph = $createParagraphNode();
        paragraph.append(paragraphText);

        const itemText = $createTextNode("An item");
        const item = $createListItemNode();
        item.append(itemText);
        const list = $createListNode("bullet");
        list.append(item);

        root.append(paragraph, list);

        keys.paragraph = paragraph.getKey();
        keys.paragraphText = paragraphText.getKey();
        keys.list = list.getKey();
        keys.item = item.getKey();
        keys.itemText = itemText.getKey();
      },
      // Committed synchronously: Lexical otherwise commits on a microtask, and
      // the read below would run against the state before any of this existed.
      { discrete: true },
    );
  });

  editor.getEditorState().read(() => {
    const blockKeyFor = (key: string) => {
      const node = $getNodeByKey(key);
      if (!node) throw new Error(`fixture lost node ${key}`);
      return $draggableBlockForNode(node)?.getKey() ?? null;
    };

    expect($draggableBlockForNode($getRoot())).toBeNull();
    expect(blockKeyFor(keys.paragraphText)).toBe(keys.paragraph);

    // Inside a list it is the item that gets dragged, not the whole list.
    expect(blockKeyFor(keys.itemText)).toBe(keys.item);

    // Hovering the list itself has no item to pick, so the list stands.
    expect(blockKeyFor(keys.list)).toBe(keys.list);
  });
});

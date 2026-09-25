import type { LexicalEditor } from "lexical";
import * as React from "react";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode } from "@lexical/rich-text";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getState,
  $setState,
} from "lexical";
import { afterEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

import type { LinkedRecord } from "./linked-checklist-plugin";
import { Editor } from "../editor";
import { linkedItemState } from "../utils/linked-checklist";
import { LinkedChecklistPlugin } from "./linked-checklist-plugin";

// Runs in the `browser` project: "the caret left the line" has to be a real
// caret moving through real key presses.

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

function Harness({
  records,
  onReady,
  createRecord,
  updateRecord,
  onLinkedIdsChange,
}: {
  records: LinkedRecord[] | undefined;
  onReady: (editor: LexicalEditor) => void;
  createRecord: (draft: {
    title: string;
    completed: boolean;
  }) => Promise<string>;
  updateRecord: (id: string, patch: object) => void;
  onLinkedIdsChange: (ids: string[]) => void;
}) {
  return (
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={onReady} />
      <LinkedChecklistPlugin
        isSectionHeading={(text) => text.toLowerCase() === "todo"}
        records={records}
        onLinkedIdsChange={onLinkedIdsChange}
        createRecord={createRecord}
        updateRecord={updateRecord}
        debounceMs={50}
      />
    </Editor>
  );
}

async function setup(
  build: () => void,
  records: LinkedRecord[] | undefined = undefined,
) {
  let editor: LexicalEditor | null = null;
  let next = 0;
  const createRecord = vi.fn(async () => `task-${++next}`);
  const updateRecord = vi.fn();
  const onLinkedIdsChange = vi.fn();
  const onReady = (value: LexicalEditor) => (editor = value);
  const props = { onReady, createRecord, updateRecord, onLinkedIdsChange };
  const view = render(<Harness records={records} {...props} />);
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  // Focus first, then the content with the caret at its very end — a click
  // after would drop the caret on whichever line it hit.
  await userEvent.click(
    document.querySelector<HTMLElement>('[contenteditable="true"]')!,
  );
  live.update(
    () => {
      build();
      $getRoot().selectEnd();
    },
    { discrete: true },
  );
  const rerender = (nextRecords: LinkedRecord[]) =>
    view.rerender(<Harness records={nextRecords} {...props} />);
  return {
    editor: live,
    createRecord,
    updateRecord,
    onLinkedIdsChange,
    rerender,
  };
}

/** A check list; an item with an id is linked, as a saved entry reloads. */
const todo = (
  ...items: [text: string, id: string | null, checked?: boolean][]
) =>
  $createListNode("check").append(
    ...items.map(([text, id, checked]) => {
      const node = $createListItemNode(checked ?? false);
      if (text) node.append($createTextNode(text));
      if (id) $setState(node, linkedItemState, id);
      return node;
    }),
  );

/** Each checklist item's text, check and link, in order. */
const snapshot = (editor: LexicalEditor) =>
  editor.getEditorState().read(() =>
    $getRoot()
      .getAllTextNodes()
      .map((text) => text.getParent())
      .filter($isListItemNode)
      .map((node) => ({
        text: node.getTextContent(),
        checked: node.getChecked() === true,
        id: $getState(node, linkedItemState),
      })),
  );

test("a to-do becomes a task once the caret leaves it, and keeps its id", async () => {
  const { editor, createRecord } = await setup(() => {
    $getRoot()
      .clear()
      .append(
        $createHeadingNode("h2").append($createTextNode("Todo")),
        todo(["Buy milk", null]),
      );
  });
  await new Promise((resolve) => setTimeout(resolve, 150));
  // Still on the line: nothing filed yet.
  expect(createRecord).not.toHaveBeenCalled();

  await userEvent.keyboard("{Enter}");

  await waitFor(() =>
    expect(createRecord).toHaveBeenCalledWith({
      title: "Buy milk",
      completed: false,
    }),
  );
  await waitFor(() =>
    expect(snapshot(editor)).toEqual([
      { text: "Buy milk", checked: false, id: "task-1" },
    ]),
  );
  expect(createRecord).toHaveBeenCalledTimes(1);
});

test("checklists outside the Todo section are left alone", async () => {
  const { createRecord } = await setup(() => {
    $getRoot()
      .clear()
      .append(
        $createHeadingNode("h2").append($createTextNode("Learned")),
        todo(["Not a task", null]),
        $createParagraphNode().append($createTextNode("end")),
      );
  });
  await new Promise((resolve) => setTimeout(resolve, 200));
  expect(createRecord).not.toHaveBeenCalled();
});

const heading = () => $createHeadingNode("h2").append($createTextNode("Todo"));
const end = () => $createParagraphNode().append($createTextNode("end"));

test("ticking a linked item completes its task; the task ticks the item back", async () => {
  const { editor, updateRecord, onLinkedIdsChange, rerender } =
    await setup(() => {
      $getRoot()
        .clear()
        .append(heading(), todo(["Buy milk", "t1"]), end());
    }, [{ id: "t1", title: "Buy milk", completed: false }]);
  await waitFor(() => expect(onLinkedIdsChange).toHaveBeenCalledWith(["t1"]));

  await userEvent.click(
    document.querySelector<HTMLElement>('li[role="checkbox"]')!,
    {
      position: { x: 4, y: 8 },
    },
  );
  await waitFor(() =>
    expect(updateRecord).toHaveBeenCalledWith("t1", { completed: true }),
  );

  // Unticked and retitled in /todo; the next fetch brings both in.
  rerender([{ id: "t1", title: "Buy oat milk", completed: false }]);
  await waitFor(() =>
    expect(snapshot(editor)).toEqual([
      { text: "Buy oat milk", checked: false, id: "t1" },
    ]),
  );
  // Taking the task's state is not a local change to send back.
  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(updateRecord).toHaveBeenCalledTimes(1);
});

test("a task deleted elsewhere leaves a plain checklist item", async () => {
  const { editor, createRecord } = await setup(() => {
    $getRoot()
      .clear()
      .append(heading(), todo(["Buy milk", "t1"]), end());
  }, [{ id: "t1", title: "Buy milk", completed: false, deleted: true }]);
  await waitFor(() =>
    expect(snapshot(editor)).toEqual([
      { text: "Buy milk", checked: false, id: null },
    ]),
  );
  // Unlinked, not re-filed: the caret never left it — it was never in it —
  // so it is filed like any new line: once, as a new task.
  await waitFor(() => expect(createRecord).toHaveBeenCalledTimes(1));
});

test("a copied linked line is filed as a task of its own", async () => {
  const { editor, createRecord } = await setup(() => {
    $getRoot()
      .clear()
      .append(heading(), todo(["Buy milk", "t1"], ["Buy milk", "t1"]), end());
  }, [{ id: "t1", title: "Buy milk", completed: false }]);
  await waitFor(() => expect(createRecord).toHaveBeenCalledTimes(1));
  await waitFor(() =>
    expect(snapshot(editor).map((entry) => entry.id)).toEqual(["t1", "task-1"]),
  );
});

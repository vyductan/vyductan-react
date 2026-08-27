import "@testing-library/jest-dom/vitest";

import type { LexicalEditor } from "lexical";
import * as React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import {
  $deleteTableColumnAtSelection,
  $insertTableColumnAtSelection,
  $isTableNode,
  $isTableRowNode,
  $moveTableColumn,
} from "@lexical/table";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $getRoot } from "lexical";
import { afterEach, describe, expect, test } from "vitest";

import { nodes } from "../nodes/nodes";
import { editorRenderFixtures } from "../render/render-fixtures";
import { invariant } from "../shared/invariant";

Object.assign(globalThis, { React });

afterEach(() => {
  cleanup();
});

function EditorRefPlugin({ onReady }: { onReady: (e: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();
  onReady(editor);
  return null;
}

function Harness({
  onReady,
  editorState = editorRenderFixtures.table.content,
}: {
  onReady: (editor: LexicalEditor) => void;
  editorState?: unknown;
}) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "TableColumnResizeStateTest",
        theme: {},
        nodes: nodes as never,
        editorState: JSON.stringify(editorState),
        onError: (error) => {
          throw error;
        },
      }}
    >
      <RichTextPlugin
        contentEditable={<ContentEditable aria-label="Resize test editor" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <TablePlugin />
      <EditorRefPlugin onReady={onReady} />
    </LexicalComposer>
  );
}

async function mountEditor(editorState?: unknown) {
  let editor: LexicalEditor | null = null;
  render(
    <Harness
      editorState={editorState}
      onReady={(instance) => {
        editor = instance;
      }}
    />,
  );

  await waitFor(() => {
    invariant(editor !== null, "Expected the harness to expose an editor");
  });

  invariant(editor !== null, "Expected the harness to expose an editor");
  return editor as LexicalEditor;
}

function readTableNode(editor: LexicalEditor) {
  let widths: readonly number[] | undefined;

  editor.getEditorState().read(() => {
    const table = $getRoot()
      .getChildren()
      .find((child) => $isTableNode(child));
    invariant(table !== undefined, "Expected a table in the fixture");
    invariant($isTableNode(table), "Expected the found node to be a table");
    widths = table.getColWidths();
  });

  return widths;
}

function setWidths(editor: LexicalEditor, widths: number[]) {
  editor.update(
    () => {
      const table = $getRoot()
        .getChildren()
        .find((child) => $isTableNode(child));
      invariant(table !== undefined && $isTableNode(table), "no table");
      table.setColWidths(widths);
    },
    { discrete: true },
  );
}

function selectFirstCell(editor: LexicalEditor) {
  editor.update(
    () => {
      const table = $getRoot()
        .getChildren()
        .find((child) => $isTableNode(child));
      invariant(table !== undefined && $isTableNode(table), "no table");
      const firstRow = table.getFirstChild();
      invariant($isTableRowNode(firstRow), "no first row");
      const firstCell = firstRow.getFirstChild();
      invariant(firstCell !== null, "no first cell");
      firstCell.selectStart();
    },
    { discrete: true },
  );
}

describe("colWidths survives the editor round trip", () => {
  test("serializes, then rehydrates", async () => {
    const editor = await mountEditor();

    setWidths(editor, [120, 240]);

    const json = JSON.parse(
      JSON.stringify(editor.getEditorState().toJSON()),
    ) as { root: { children: { type: string; colWidths?: number[] }[] } };
    const tableJson = json.root.children.find(
      (child) => child.type === "table",
    );

    expect(tableJson?.colWidths).toEqual([120, 240]);

    // A fresh editor built from that JSON has to come back with the widths, or
    // a reopened document silently loses its layout.
    const reopened = await mountEditor(json);
    expect(readTableNode(reopened)).toEqual([120, 240]);
  });
});

/**
 * The reason this feature rides `TableNode.colWidths` rather than a hand-rolled
 * map: @lexical/table already keeps the array in step with structural edits.
 * These pin that behaviour in the installed version instead of trusting it.
 */
describe("the library keeps widths aligned with structural edits", () => {
  test("inserting a column duplicates the neighbour's width", async () => {
    const editor = await mountEditor();
    setWidths(editor, [120, 240]);
    selectFirstCell(editor);

    editor.update(
      () => {
        $insertTableColumnAtSelection(true);
      },
      { discrete: true },
    );

    expect(readTableNode(editor)).toEqual([120, 120, 240]);
  });

  test("deleting a column splices its width out", async () => {
    const editor = await mountEditor();
    setWidths(editor, [120, 240]);
    selectFirstCell(editor);

    editor.update(
      () => {
        $deleteTableColumnAtSelection();
      },
      { discrete: true },
    );

    expect(readTableNode(editor)).toEqual([240]);
  });

  test("moving a column reorders the widths with it", async () => {
    const editor = await mountEditor();
    setWidths(editor, [120, 240]);

    editor.update(
      () => {
        const table = $getRoot()
          .getChildren()
          .find((child) => $isTableNode(child));
        invariant(table !== undefined && $isTableNode(table), "no table");
        $moveTableColumn(table, 0, 1);
      },
      { discrete: true },
    );

    expect(readTableNode(editor)).toEqual([240, 120]);
  });
});

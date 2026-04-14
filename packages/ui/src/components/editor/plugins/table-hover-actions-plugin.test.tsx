/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { nodes } from "../nodes/nodes";
import { editorRenderFixtures } from "../render/render-fixtures";
import { TableHoverActionsPlugin } from "./table-hover-actions-plugin";

Object.assign(globalThis, { React });

function TableHoverActionsHarness() {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "TableHoverActionsPluginTest",
        theme: {},
        nodes: nodes as never,
        editorState: JSON.stringify(editorRenderFixtures.table.content),
        onError: (error) => {
          throw error;
        },
      }}
    >
      <RichTextPlugin
        contentEditable={<ContentEditable aria-label="Table editor" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <TablePlugin />
      <TableHoverActionsPlugin anchorElem={document.body} />
    </LexicalComposer>
  );
}

afterEach(() => {
  cleanup();
});

test("does not show hover actions when a table cell is only focused", async () => {
  const { container } = render(<TableHoverActionsHarness />);

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  const firstHeaderCell = table.rows[0]?.cells[0];
  expect(firstHeaderCell).not.toBeUndefined();

  fireEvent.mouseUp(firstHeaderCell as HTMLTableCellElement);

  expect(
    screen.queryByTitle(/click to add a new column/i),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByTitle(/click to add a new row/i),
  ).not.toBeInTheDocument();
});

test("adds a new column after the last existing column from the hover action", async () => {
  const { container } = render(<TableHoverActionsHarness />);

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  Object.defineProperty(table, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      x: 20,
      y: 10,
      top: 10,
      right: 200,
      bottom: 110,
      left: 20,
      width: 180,
      height: 100,
      toJSON: () => ({}),
    }),
  });

  const lastHeaderCell = table.querySelector("tr:first-of-type > *:last-child");
  expect(lastHeaderCell).not.toBeNull();

  fireEvent.mouseMove(lastHeaderCell as Element, {
    clientX: 198,
    clientY: 40,
  });

  const addColumnButton = await screen.findByTitle(
    /click to add a new column/i,
  );
  fireEvent.click(addColumnButton);

  await waitFor(() => {
    const headerRow = table.rows.item(0);
    const bodyRow = table.rows.item(1);

    expect(headerRow).not.toBeNull();
    expect(bodyRow).not.toBeNull();

    const headerCells = [...(headerRow as HTMLTableRowElement).cells].map(
      (cell) => cell.textContent?.trim() ?? "",
    );
    const bodyCells = [...(bodyRow as HTMLTableRowElement).cells].map(
      (cell) => cell.textContent?.trim() ?? "",
    );

    expect(headerCells).toEqual(["Header A", "Header B", ""]);
    expect(bodyCells).toEqual(["Cell A1", "Cell B1", ""]);
  });
});

test("adds a new row from the bottom hover action", async () => {
  const { container } = render(<TableHoverActionsHarness />);

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  Object.defineProperty(table, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      x: 20,
      y: 10,
      top: 10,
      right: 200,
      bottom: 110,
      left: 20,
      width: 180,
      height: 100,
      toJSON: () => ({}),
    }),
  });

  const lastBodyCell = table.querySelector("tr:last-of-type > *:last-child");
  expect(lastBodyCell).not.toBeNull();

  fireEvent.mouseMove(lastBodyCell as Element, {
    clientX: 120,
    clientY: 108,
  });

  const addRowButton = await screen.findByTitle(/click to add a new row/i);
  fireEvent.click(addRowButton);

  await waitFor(() => {
    expect(table.rows).toHaveLength(3);
    const newRow = table.rows.item(2);
    expect(newRow).not.toBeNull();

    const newRowCells = [...(newRow as HTMLTableRowElement).cells].map(
      (cell) => cell.textContent?.trim() ?? "",
    );

    expect(newRowCells).toEqual(["", ""]);
  });
});

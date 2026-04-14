/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import "@testing-library/jest-dom/vitest";

import type { LexicalEditor } from "lexical";
import type { LexicalEditorContent } from "../types";
import * as React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import {
  $createTableSelectionFrom,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
} from "@lexical/table";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setSelection,
} from "lexical";
import { afterEach, expect, test } from "vitest";

import { nodes } from "../nodes/nodes";
import { editorRenderFixtures } from "../render/render-fixtures";
import { TableCellActionMenuPlugin } from "./table-cell-action-menu-plugin";
import { invariant } from "../shared/invariant";

Object.assign(globalThis, { React });

class TestDragEvent extends MouseEvent {
  dataTransfer: DataTransfer | null;

  constructor(
    type: string,
    init?: MouseEventInit & { dataTransfer?: DataTransfer | null },
  ) {
    super(type, init);
    this.dataTransfer = init?.dataTransfer ?? null;
  }
}

Object.assign(globalThis, {
  DragEvent: TestDragEvent,
});

Object.assign(document, {
  caretPositionFromPoint: () => null,
});

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

const threeRowTableContent = {
  root: {
    type: "root",
    direction: null,
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "table",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "tablerow",
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "tablecell",
                backgroundColor: null as string | null,
                colSpan: 1,
                rowSpan: 1,
                headerState: 1,
                direction: null,
                format: "",
                indent: 0,
                version: 1,
                children: [
                  {
                    type: "paragraph",
                    direction: null,
                    format: "",
                    indent: 0,
                    version: 1,
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Header A",
                        type: "text",
                        version: 1,
                      },
                    ],
                  },
                ],
              },
              {
                type: "tablecell",
                backgroundColor: null as string | null,
                colSpan: 1,
                rowSpan: 1,
                headerState: 1,
                direction: null,
                format: "",
                indent: 0,
                version: 1,
                children: [
                  {
                    type: "paragraph",
                    direction: null,
                    format: "",
                    indent: 0,
                    version: 1,
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Header B",
                        type: "text",
                        version: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "tablerow",
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "tablecell",
                backgroundColor: null as string | null,
                colSpan: 1,
                rowSpan: 1,
                headerState: 0,
                direction: null,
                format: "",
                indent: 0,
                version: 1,
                children: [
                  {
                    type: "paragraph",
                    direction: null,
                    format: "",
                    indent: 0,
                    version: 1,
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Cell A1",
                        type: "text",
                        version: 1,
                      },
                    ],
                  },
                ],
              },
              {
                type: "tablecell",
                backgroundColor: null as string | null,
                colSpan: 1,
                rowSpan: 1,
                headerState: 0,
                direction: null,
                format: "",
                indent: 0,
                version: 1,
                children: [
                  {
                    type: "paragraph",
                    direction: null,
                    format: "",
                    indent: 0,
                    version: 1,
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Cell B1",
                        type: "text",
                        version: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "tablerow",
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                type: "tablecell",
                backgroundColor: null as string | null,
                colSpan: 1,
                rowSpan: 1,
                headerState: 0,
                direction: null,
                format: "",
                indent: 0,
                version: 1,
                children: [
                  {
                    type: "paragraph",
                    direction: null,
                    format: "",
                    indent: 0,
                    version: 1,
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Cell A2",
                        type: "text",
                        version: 1,
                      },
                    ],
                  },
                ],
              },
              {
                type: "tablecell",
                backgroundColor: null as string | null,
                colSpan: 1,
                rowSpan: 1,
                headerState: 0,
                direction: null,
                format: "",
                indent: 0,
                version: 1,
                children: [
                  {
                    type: "paragraph",
                    direction: null,
                    format: "",
                    indent: 0,
                    version: 1,
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Cell B2",
                        type: "text",
                        version: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
} satisfies LexicalEditorContent;

const mixedColorTableContent = structuredClone(threeRowTableContent);

type BackgroundColorCell = {
  backgroundColor: string | null;
};

type FixtureNodeWithChildren = {
  children: unknown[];
};

function getColoredCellOrThrow(
  content: LexicalEditorContent,
  rowIndex: number,
  cellIndex: number,
): BackgroundColorCell {
  const tableNode = content.root.children[0] as FixtureNodeWithChildren | undefined;
  invariant(tableNode !== undefined, "Expected fixture root to contain a table node");

  const rowNode = tableNode.children[rowIndex] as FixtureNodeWithChildren | undefined;
  invariant(rowNode !== undefined, "Expected fixture row node to exist");

  const cellNode = rowNode.children[cellIndex] as BackgroundColorCell | undefined;
  invariant(
    cellNode !== undefined,
    "Expected fixture cell node to contain backgroundColor",
  );

  return cellNode;
}

getColoredCellOrThrow(mixedColorTableContent, 0, 0).backgroundColor = "#dbeafe";
getColoredCellOrThrow(mixedColorTableContent, 0, 1).backgroundColor = "#fee2e2";
getColoredCellOrThrow(mixedColorTableContent, 2, 0).backgroundColor = "#dcfce7";

function getEditorOrThrow(editor: LexicalEditor | null): LexicalEditor {
  invariant(editor !== null, "Expected test harness to provide a Lexical editor");
  return editor;
}

function TableCellActionMenuHarness({
  onReady,
  editorState = editorRenderFixtures.table.content,
}: {
  onReady?: (editor: LexicalEditor) => void;
  editorState?: unknown;
}) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "TableCellActionMenuPluginTest",
        theme: {},
        nodes: nodes as never,
        editorState: JSON.stringify(editorState),
        onError: (error) => {
          throw error;
        },
      }}
    >
      <RichTextPlugin
        contentEditable={
          <ContentEditable aria-label="Table action menu editor" />
        }
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <TablePlugin />
      <TableCellActionMenuPlugin anchorElem={document.body} />
      {onReady ? <EditorRefPlugin onReady={onReady} /> : null}
    </LexicalComposer>
  );
}

afterEach(() => {
  cleanup();
});

test("shows row and column action handles when a table cell is selected", async () => {
  const { container } = render(<TableCellActionMenuHarness />);

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  const firstHeaderCell = table.rows[0]?.cells[0];
  expect(firstHeaderCell).not.toBeUndefined();

  fireEvent.mouseUp(firstHeaderCell as HTMLTableCellElement);

  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: /row actions/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /column actions/i }),
    ).toBeInTheDocument();
  });
});

test("shows header-row toggle only for the first row and renders row action icons", async () => {
  const { container } = render(<TableCellActionMenuHarness />);

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  const firstHeaderCell = table.rows[0]?.cells[0];
  expect(firstHeaderCell).not.toBeUndefined();

  fireEvent.mouseUp(firstHeaderCell as HTMLTableCellElement);

  const rowHandle = await screen.findByRole("button", { name: /row actions/i });
  fireEvent.click(rowHandle);

  await waitFor(() => {
    expect(screen.getByText("Search actions...")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /header row/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("table-action-toggle-header-row"),
    ).toHaveAttribute("data-state", "checked");
    expect(
      screen.getByRole("menuitem", { name: /insert above/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /insert below/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /duplicate/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /delete/i }),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole("menuitem", { name: /insert above/i })
        .querySelector('[role="img"], svg'),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("menuitem", { name: /delete/i })
        .querySelector('[role="img"], svg'),
    ).not.toBeNull();
  });

  fireEvent.click(rowHandle);

  const firstBodyCell = table.rows[1]?.cells[0];
  expect(firstBodyCell).not.toBeUndefined();

  fireEvent.mouseUp(firstBodyCell as HTMLTableCellElement);
  fireEvent.click(await screen.findByRole("button", { name: /row actions/i }));

  await waitFor(() => {
    expect(
      screen.queryByRole("menuitem", { name: /header row/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /insert above/i }),
    ).toBeInTheDocument();
  });
});

test("applies a row color preset to every cell in the selected row", async () => {
  const { container } = render(
    <TableCellActionMenuHarness editorState={threeRowTableContent} />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  const firstBodyCell = table.rows[1]?.cells[0];
  const secondBodyCell = table.rows[1]?.cells[1];
  expect(firstBodyCell).not.toBeUndefined();
  expect(secondBodyCell).not.toBeUndefined();

  fireEvent.mouseUp(firstBodyCell as HTMLTableCellElement);
  fireEvent.click(await screen.findByRole("button", { name: /row actions/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /color/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /blue/i }));

  await waitFor(() => {
    expect(
      (table.rows[1]?.cells[0] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(219, 234, 254)");
    expect(
      (table.rows[1]?.cells[1] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(219, 234, 254)");
  });
});

test("shows the selected row color on the parent color action", async () => {
  const { container } = render(
    <TableCellActionMenuHarness editorState={threeRowTableContent} />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  const firstBodyCell = table.rows[1]?.cells[0];
  expect(firstBodyCell).not.toBeUndefined();

  fireEvent.mouseUp(firstBodyCell as HTMLTableCellElement);
  fireEvent.click(await screen.findByRole("button", { name: /row actions/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /color/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /blue/i }));
  fireEvent.click(await screen.findByRole("button", { name: /row actions/i }));

  const colorAction = await screen.findByRole("menuitem", { name: /color/i });
  const preview = colorAction.querySelector(
    '[data-testid="table-action-color-preview-row"]',
  );

  expect(preview).not.toBeNull();
  expect(preview).toHaveStyle({ backgroundColor: "rgb(219, 234, 254)" });
});

test("shows a mixed indicator on the row color action when row colors differ", async () => {
  const { container } = render(
    <TableCellActionMenuHarness editorState={mixedColorTableContent} />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  const firstHeaderCell = table.rows[0]?.cells[0];
  expect(firstHeaderCell).not.toBeUndefined();

  fireEvent.mouseUp(firstHeaderCell as HTMLTableCellElement);
  fireEvent.click(await screen.findByRole("button", { name: /row actions/i }));

  const colorAction = await screen.findByRole("menuitem", { name: /color/i });
  expect(
    colorAction.querySelector('[data-testid="table-action-color-mixed-row"]'),
  ).not.toBeNull();
});

test("shows a mixed indicator on the column color action when column colors differ", async () => {
  const { container } = render(
    <TableCellActionMenuHarness editorState={mixedColorTableContent} />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  const firstHeaderCell = table.rows[0]?.cells[0];
  expect(firstHeaderCell).not.toBeUndefined();

  fireEvent.mouseUp(firstHeaderCell as HTMLTableCellElement);
  fireEvent.click(
    await screen.findByRole("button", { name: /column actions/i }),
  );

  const colorAction = await screen.findByRole("menuitem", { name: /color/i });
  expect(
    colorAction.querySelector(
      '[data-testid="table-action-color-mixed-column"]',
    ),
  ).not.toBeNull();
});

test("applies and clears a column color preset", async () => {
  const { container } = render(
    <TableCellActionMenuHarness editorState={threeRowTableContent} />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  const headerCell = table.rows[0]?.cells[0];
  const firstBodyCell = table.rows[1]?.cells[0];
  const secondBodyCell = table.rows[2]?.cells[0];
  expect(headerCell).not.toBeUndefined();
  expect(firstBodyCell).not.toBeUndefined();
  expect(secondBodyCell).not.toBeUndefined();

  fireEvent.mouseUp(headerCell as HTMLTableCellElement);
  fireEvent.click(
    await screen.findByRole("button", { name: /column actions/i }),
  );
  fireEvent.click(await screen.findByRole("menuitem", { name: /color/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /green/i }));

  await waitFor(() => {
    expect(
      (table.rows[0]?.cells[0] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(220, 252, 231)");
    expect(
      (table.rows[1]?.cells[0] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(220, 252, 231)");
    expect(
      (table.rows[2]?.cells[0] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(220, 252, 231)");
  });

  fireEvent.click(
    await screen.findByRole("button", { name: /column actions/i }),
  );
  fireEvent.click(await screen.findByRole("menuitem", { name: /color/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /default/i }));

  await waitFor(() => {
    expect(
      (table.rows[0]?.cells[0] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("");
    expect(
      (table.rows[1]?.cells[0] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("");
    expect(
      (table.rows[2]?.cells[0] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("");
  });
});

test("duplicates a row with its cell data and colors", async () => {
  const { container } = render(
    <TableCellActionMenuHarness editorState={threeRowTableContent} />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  fireEvent.mouseUp(table.rows[1]?.cells[0] as HTMLTableCellElement);
  fireEvent.click(await screen.findByRole("button", { name: /row actions/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /color/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /blue/i }));
  fireEvent.click(await screen.findByRole("button", { name: /row actions/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /duplicate/i }));

  await waitFor(() => {
    expect(table.rows).toHaveLength(4);
    expect(table.rows[2]?.cells[0]?.textContent?.trim()).toBe("Cell A1");
    expect(table.rows[2]?.cells[1]?.textContent?.trim()).toBe("Cell B1");
    expect(
      (table.rows[2]?.cells[0] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(219, 234, 254)");
    expect(
      (table.rows[2]?.cells[1] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(219, 234, 254)");
  });
});

test("duplicates a column with its cell data and colors", async () => {
  const { container } = render(
    <TableCellActionMenuHarness editorState={threeRowTableContent} />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  fireEvent.mouseUp(table.rows[0]?.cells[0] as HTMLTableCellElement);
  fireEvent.click(
    await screen.findByRole("button", { name: /column actions/i }),
  );
  fireEvent.click(await screen.findByRole("menuitem", { name: /color/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /green/i }));
  fireEvent.click(
    await screen.findByRole("button", { name: /column actions/i }),
  );
  fireEvent.click(await screen.findByRole("menuitem", { name: /duplicate/i }));

  await waitFor(() => {
    expect(table.rows[0]?.cells).toHaveLength(3);
    expect(table.rows[0]?.cells[1]?.textContent?.trim()).toBe("Header A");
    expect(table.rows[1]?.cells[1]?.textContent?.trim()).toBe("Cell A1");
    expect(table.rows[2]?.cells[1]?.textContent?.trim()).toBe("Cell A2");
    expect(
      (table.rows[0]?.cells[1] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(220, 252, 231)");
    expect(
      (table.rows[1]?.cells[1] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(220, 252, 231)");
    expect(
      (table.rows[2]?.cells[1] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(220, 252, 231)");
  });
});

test("inserts a row that inherits the active row colors", async () => {
  const { container } = render(
    <TableCellActionMenuHarness editorState={threeRowTableContent} />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  fireEvent.mouseUp(table.rows[1]?.cells[0] as HTMLTableCellElement);
  fireEvent.click(await screen.findByRole("button", { name: /row actions/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /color/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /blue/i }));
  fireEvent.click(await screen.findByRole("button", { name: /row actions/i }));
  fireEvent.click(
    await screen.findByRole("menuitem", { name: /insert below/i }),
  );

  await waitFor(() => {
    expect(table.rows).toHaveLength(4);
    expect(
      (table.rows[2]?.cells[0] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(219, 234, 254)");
    expect(
      (table.rows[2]?.cells[1] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(219, 234, 254)");
  });
});

test("inserts a column that inherits the active column colors", async () => {
  const { container } = render(
    <TableCellActionMenuHarness editorState={threeRowTableContent} />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  fireEvent.mouseUp(table.rows[0]?.cells[0] as HTMLTableCellElement);
  fireEvent.click(
    await screen.findByRole("button", { name: /column actions/i }),
  );
  fireEvent.click(await screen.findByRole("menuitem", { name: /color/i }));
  fireEvent.click(await screen.findByRole("menuitem", { name: /green/i }));
  fireEvent.click(
    await screen.findByRole("button", { name: /column actions/i }),
  );
  fireEvent.click(
    await screen.findByRole("menuitem", { name: /insert right/i }),
  );

  await waitFor(() => {
    expect(table.rows[0]?.cells).toHaveLength(3);
    expect(
      (table.rows[0]?.cells[1] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(220, 252, 231)");
    expect(
      (table.rows[1]?.cells[1] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(220, 252, 231)");
    expect(
      (table.rows[2]?.cells[1] as HTMLTableCellElement | undefined)?.style
        .backgroundColor,
    ).toBe("rgb(220, 252, 231)");
  });
});

test("hides the action handles when selection becomes a table selection", async () => {
  let editor: LexicalEditor | null = null;
  const { container } = render(
    <TableCellActionMenuHarness
      onReady={(nextEditor) => {
        editor = nextEditor;
      }}
    />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  const firstHeaderCell = table.rows[0]?.cells[0];
  expect(firstHeaderCell).not.toBeUndefined();

  fireEvent.mouseUp(firstHeaderCell as HTMLTableCellElement);

  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: /row actions/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /column actions/i }),
    ).toBeInTheDocument();
  });

  const lexicalEditor = getEditorOrThrow(editor);

  lexicalEditor.update(() => {
    const root = $getRoot();
    const tableNode = root.getFirstChild();
    expect($isTableNode(tableNode)).toBe(true);
    if (!$isTableNode(tableNode)) {
      return;
    }

    const firstRow = tableNode.getFirstChild();
    expect($isTableRowNode(firstRow)).toBe(true);
    if (!$isTableRowNode(firstRow)) {
      return;
    }

    const anchorCell = firstRow.getChildAtIndex(0);
    const focusCell = firstRow.getChildAtIndex(1);
    expect($isTableCellNode(anchorCell)).toBe(true);
    expect($isTableCellNode(focusCell)).toBe(true);
    if (!$isTableCellNode(anchorCell) || !$isTableCellNode(focusCell)) {
      return;
    }

    $setSelection($createTableSelectionFrom(tableNode, anchorCell, focusCell));
  });

  await waitFor(() => {
    expect(
      screen.queryByRole("button", { name: /row actions/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /column actions/i }),
    ).not.toBeInTheDocument();
  });
});

test("hides the action handles when selection moves outside the table", async () => {
  let editor: LexicalEditor | null = null;
  const { container } = render(
    <TableCellActionMenuHarness
      onReady={(nextEditor) => {
        editor = nextEditor;
      }}
    />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  const firstHeaderCell = table.rows[0]?.cells[0];
  expect(firstHeaderCell).not.toBeUndefined();

  fireEvent.mouseUp(firstHeaderCell as HTMLTableCellElement);

  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: /row actions/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /column actions/i }),
    ).toBeInTheDocument();
  });

  const lexicalEditor = getEditorOrThrow(editor);

  lexicalEditor.update(() => {
    const paragraph = $createParagraphNode();
    paragraph.append($createTextNode("Outside table"));
    $getRoot().append(paragraph);
    paragraph.selectEnd();
  });

  await waitFor(() => {
    expect(
      screen.queryByRole("button", { name: /row actions/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /column actions/i }),
    ).not.toBeInTheDocument();
  });
});

function createMockDataTransfer() {
  return {
    types: [] as string[],
    files: [] as File[],
    setData: (_format: string, _data: string) => null,
    getData: () => "",
    clearData: (_format?: string) => null,
    effectAllowed: "move",
    dropEffect: "move",
  };
}

function mockThreeRowTableGeometry(table: HTMLTableElement) {
  Object.defineProperty(table, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      x: 20,
      y: 10,
      top: 10,
      right: 220,
      bottom: 130,
      left: 20,
      width: 200,
      height: 120,
      toJSON: () => ({}),
    }),
  });

  for (const [index, row] of [...table.rows].entries()) {
    Object.defineProperty(row, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        x: 20,
        y: 10 + index * 40,
        top: 10 + index * 40,
        right: 220,
        bottom: 50 + index * 40,
        left: 20,
        width: 200,
        height: 40,
        toJSON: () => ({}),
      }),
    });
  }

  const firstHeaderCell = table.rows[0]?.cells[0];
  const secondHeaderCell = table.rows[0]?.cells[1];
  const firstBodyFirstCell = table.rows[1]?.cells[0];
  const secondBodyFirstCell = table.rows[2]?.cells[0];

  Object.defineProperty(
    firstHeaderCell as HTMLTableCellElement,
    "getBoundingClientRect",
    {
      configurable: true,
      value: () => ({
        x: 20,
        y: 10,
        top: 10,
        right: 120,
        bottom: 50,
        left: 20,
        width: 100,
        height: 40,
        toJSON: () => ({}),
      }),
    },
  );

  Object.defineProperty(
    secondHeaderCell as HTMLTableCellElement,
    "getBoundingClientRect",
    {
      configurable: true,
      value: () => ({
        x: 120,
        y: 10,
        top: 10,
        right: 220,
        bottom: 50,
        left: 120,
        width: 100,
        height: 40,
        toJSON: () => ({}),
      }),
    },
  );

  Object.defineProperty(
    firstBodyFirstCell as HTMLTableCellElement,
    "getBoundingClientRect",
    {
      configurable: true,
      value: () => ({
        x: 20,
        y: 50,
        top: 50,
        right: 120,
        bottom: 90,
        left: 20,
        width: 100,
        height: 40,
        toJSON: () => ({}),
      }),
    },
  );

  Object.defineProperty(
    secondBodyFirstCell as HTMLTableCellElement,
    "getBoundingClientRect",
    {
      configurable: true,
      value: () => ({
        x: 20,
        y: 90,
        top: 90,
        right: 120,
        bottom: 130,
        left: 20,
        width: 100,
        height: 40,
        toJSON: () => ({}),
      }),
    },
  );
}

test("reorders rows when dragging the row handle below the next row", async () => {
  const { container } = render(
    <TableCellActionMenuHarness editorState={threeRowTableContent} />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  mockThreeRowTableGeometry(table);

  const sourceCell = table.rows[1]?.cells[0];
  expect(sourceCell).not.toBeUndefined();

  fireEvent.mouseUp(sourceCell as HTMLTableCellElement);

  const rowHandle = await screen.findByRole("button", { name: /row actions/i });
  const dataTransfer = createMockDataTransfer();

  fireEvent.dragStart(rowHandle, { dataTransfer });
  fireEvent.dragOver(rowHandle, {
    dataTransfer,
    clientX: 80,
    clientY: 120,
  });

  await waitFor(() => {
    expect(
      document.querySelector('[data-table-drop-indicator="row"]'),
    ).not.toBeNull();
  });

  fireEvent.drop(rowHandle, {
    dataTransfer,
    clientX: 80,
    clientY: 120,
  });
  fireEvent.dragEnd(rowHandle, { dataTransfer });

  await waitFor(() => {
    const firstBodyRow = table.rows.item(1);
    const secondBodyRow = table.rows.item(2);

    expect(firstBodyRow).not.toBeNull();
    expect(secondBodyRow).not.toBeNull();
    expect(
      (firstBodyRow as HTMLTableRowElement).cells.item(0)?.textContent?.trim(),
    ).toBe("Cell A2");
    expect(
      (secondBodyRow as HTMLTableRowElement).cells.item(0)?.textContent?.trim(),
    ).toBe("Cell A1");
  });
});

test("reorders columns when dragging the column handle to the right", async () => {
  const { container } = render(
    <TableCellActionMenuHarness editorState={threeRowTableContent} />,
  );

  const table = await waitFor(() => {
    const element = container.querySelector("table");
    expect(element).not.toBeNull();
    return element as HTMLTableElement;
  });

  mockThreeRowTableGeometry(table);

  const firstHeaderCell = table.rows[0]?.cells[0];
  expect(firstHeaderCell).not.toBeUndefined();

  fireEvent.mouseUp(firstHeaderCell as HTMLTableCellElement);

  const columnHandle = await screen.findByRole("button", {
    name: /column actions/i,
  });
  const dataTransfer = createMockDataTransfer();

  fireEvent.dragStart(columnHandle, { dataTransfer });
  fireEvent.dragOver(columnHandle, {
    dataTransfer,
    clientX: 180,
    clientY: 30,
  });

  await waitFor(() => {
    expect(
      document.querySelector('[data-table-drop-indicator="column"]'),
    ).not.toBeNull();
  });

  fireEvent.drop(columnHandle, {
    dataTransfer,
    clientX: 180,
    clientY: 30,
  });
  fireEvent.dragEnd(columnHandle, { dataTransfer });

  await waitFor(() => {
    const headerRow = table.rows.item(0);
    const firstBodyRow = table.rows.item(1);

    expect(headerRow).not.toBeNull();
    expect(firstBodyRow).not.toBeNull();
    expect(
      (headerRow as HTMLTableRowElement).cells.item(0)?.textContent?.trim(),
    ).toBe("Header B");
    expect(
      (headerRow as HTMLTableRowElement).cells.item(1)?.textContent?.trim(),
    ).toBe("Header A");
    expect(
      (firstBodyRow as HTMLTableRowElement).cells.item(0)?.textContent?.trim(),
    ).toBe("Cell B1");
    expect(
      (firstBodyRow as HTMLTableRowElement).cells.item(1)?.textContent?.trim(),
    ).toBe("Cell A1");
  });
});

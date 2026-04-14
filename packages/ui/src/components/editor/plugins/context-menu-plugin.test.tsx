/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
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
import { $getNearestNodeFromDOMNode, $getRoot, $setSelection } from "lexical";
import { afterEach, expect, test, vi } from "vitest";

import { nodes } from "../nodes/nodes";
import { editorRenderFixtures } from "../render/render-fixtures";
import { ContextMenuPlugin } from "./context-menu-plugin";
import { invariant } from "../shared/invariant";

Object.assign(globalThis, { React });

vi.mock("./default/lexical-context-menu-plugin", async () => {
  const React = await import("react");

  class NodeContextMenuOption {
    key: string;
    title: string;
    $onSelect: () => void;
    $showOn?: (node: unknown) => boolean;

    constructor(
      title: string,
      options: {
        $onSelect: () => void;
        $showOn?: (node: unknown) => boolean;
      },
    ) {
      this.key = title;
      this.title = title;
      this.$onSelect = options.$onSelect;
      this.$showOn = options.$showOn;
    }
  }

  return {
    NodeContextMenuOption,
    NodeContextMenuPlugin: ({
      items,
    }: {
      items: Array<{
        key: string;
        title: string;
        $onSelect: () => void;
        $showOn?: (node: unknown) => boolean;
      }>;
    }) => {
      const [visibleItems, setVisibleItems] = React.useState(items);

      React.useEffect(() => {
        const handleContextMenu = (event: MouseEvent) => {
          event.preventDefault();

          const editor = (
            globalThis as {
              __TEST_CONTEXT_MENU_EDITOR__?: LexicalEditor | null;
            }
          ).__TEST_CONTEXT_MENU_EDITOR__;
          if (!editor) {
            return;
          }

          editor.read(() => {
            const targetNode = $getNearestNodeFromDOMNode(event.target as Node);
            setVisibleItems(
              items.filter((item) => {
                if (!item.$showOn) {
                  return true;
                }

                if (!targetNode) {
                  return false;
                }

                return item.$showOn(targetNode);
              }),
            );
          });
        };

        document.addEventListener("contextmenu", handleContextMenu);
        return () => {
          document.removeEventListener("contextmenu", handleContextMenu);
        };
      }, [items]);

      return (
        <div data-testid="context-menu-options">
          {visibleItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                const editor = (
                  globalThis as {
                    __TEST_CONTEXT_MENU_EDITOR__?: LexicalEditor | null;
                  }
                ).__TEST_CONTEXT_MENU_EDITOR__;
                editor?.update(() => {
                  item.$onSelect();
                });
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
      );
    },
  };
});

function EditorRefPlugin({
  onReady,
}: {
  onReady: (editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    (
      globalThis as { __TEST_CONTEXT_MENU_EDITOR__?: LexicalEditor | null }
    ).__TEST_CONTEXT_MENU_EDITOR__ = editor;
    onReady(editor);

    return () => {
      (
        globalThis as { __TEST_CONTEXT_MENU_EDITOR__?: LexicalEditor | null }
      ).__TEST_CONTEXT_MENU_EDITOR__ = null;
    };
  }, [editor, onReady]);

  return null;
}

function getEditorOrThrow(editor: LexicalEditor | null): LexicalEditor {
  invariant(editor !== null, "Expected test harness to provide a Lexical editor");
  return editor;
}

function ContextMenuHarness({
  onReady,
}: {
  onReady?: (editor: LexicalEditor) => void;
}) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "ContextMenuPluginTest",
        theme: {},
        nodes: nodes as never,
        editorState: JSON.stringify(editorRenderFixtures.table.content),
        onError: (error) => {
          throw error;
        },
      }}
    >
      <RichTextPlugin
        contentEditable={<ContentEditable aria-label="Context menu editor" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <TablePlugin />
      <ContextMenuPlugin />
      {onReady ? <EditorRefPlugin onReady={onReady} /> : null}
    </LexicalComposer>
  );
}

afterEach(() => {
  cleanup();
});

const elementsFromPointResult: Element[] = [];

Object.defineProperty(document, "elementsFromPoint", {
  configurable: true,
  value: (_x: number, _y: number) => elementsFromPointResult,
});

function getTableSelectionObserver(table: HTMLTableElement): unknown {
  return (table as HTMLTableElement & { __lexicalTableSelection?: unknown })
    .__lexicalTableSelection;
}

test("hides generic copy and paste items from the editor context menu", async () => {
  let editor: LexicalEditor | null = null;

  render(
    <ContextMenuHarness
      onReady={(nextEditor) => {
        editor = nextEditor;
      }}
    />,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  fireEvent.contextMenu(screen.getByText("Header A"));

  await waitFor(() => {
    expect(
      screen.queryByRole("button", { name: "Copy" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cut" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Paste" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Paste as Plain Text" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete Node" }),
    ).not.toBeInTheDocument();
  });
});

test("shows table row and column actions when opening the context menu inside a table cell", async () => {
  let editor: LexicalEditor | null = null;

  render(
    <ContextMenuHarness
      onReady={(nextEditor) => {
        editor = nextEditor;
      }}
    />,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const lexicalEditor = getEditorOrThrow(editor);

  lexicalEditor.update(() => {
    const table = $getRoot().getFirstChild();
    if (!$isTableNode(table)) {
      return;
    }

    const firstRow = table.getFirstChild();
    if (!$isTableRowNode(firstRow)) {
      return;
    }

    const firstCell = firstRow.getChildAtIndex(0);
    if ($isTableCellNode(firstCell)) {
      firstCell.selectEnd();
    }
  });

  fireEvent.contextMenu(screen.getByText("Header A"));

  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: "Insert Row Above" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Insert Row Below" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Insert Column Left" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Insert Column Right" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete Row" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete Column" }),
    ).toBeInTheDocument();
  });
});

test("executes insert column right from the table context menu", async () => {
  let editor: LexicalEditor | null = null;
  const { container } = render(
    <ContextMenuHarness
      onReady={(nextEditor) => {
        editor = nextEditor;
      }}
    />,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const lexicalEditor = getEditorOrThrow(editor);

  lexicalEditor.update(() => {
    const table = $getRoot().getFirstChild();
    if (!$isTableNode(table)) {
      return;
    }

    const firstRow = table.getFirstChild();
    if (!$isTableRowNode(firstRow)) {
      return;
    }

    const firstCell = firstRow.getChildAtIndex(0);
    if ($isTableCellNode(firstCell)) {
      firstCell.selectEnd();
    }
  });

  fireEvent.contextMenu(screen.getByText("Header A"));
  fireEvent.click(
    await screen.findByRole("button", { name: "Insert Column Right" }),
  );

  await waitFor(() => {
    const table = container.querySelector("table") as HTMLTableElement | null;
    expect(table).not.toBeNull();

    const headerRow = table?.rows.item(0);
    expect(headerRow).not.toBeNull();

    const headerCells = [...(headerRow as HTMLTableRowElement).cells].map(
      (cell) => cell.textContent?.trim() ?? "",
    );

    expect(headerCells).toEqual(["Header A", "", "Header B"]);
  });
});

test("shows merge cells for a table selection and split cell after merging", async () => {
  let editor: LexicalEditor | null = null;
  const { container } = render(
    <ContextMenuHarness
      onReady={(nextEditor) => {
        editor = nextEditor;
      }}
    />,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const lexicalEditor = getEditorOrThrow(editor);

  const tableElement = await waitFor(() => {
    const element = container.querySelector("table") as HTMLTableElement | null;
    expect(element).not.toBeNull();
    expect(element ? getTableSelectionObserver(element) : null).not.toBeNull();
    return element as HTMLTableElement;
  });

  let tableKey: string | null = null;
  lexicalEditor.read(() => {
    const table = $getRoot().getFirstChild();
    if ($isTableNode(table)) {
      tableKey = table.getKey();
    }
  });

  const originalGetElementByKey =
    lexicalEditor.getElementByKey.bind(lexicalEditor);
  if (tableKey) {
    lexicalEditor.getElementByKey = ((key: string) => {
      const element = originalGetElementByKey(key);
      if (element) {
        return element;
      }

      return key === tableKey ? tableElement : null;
    }) as typeof lexicalEditor.getElementByKey;
  }

  lexicalEditor.update(() => {
    const table = $getRoot().getFirstChild();
    expect($isTableNode(table)).toBe(true);
    if (!$isTableNode(table)) {
      return;
    }

    const firstRow = table.getFirstChild();
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

    $setSelection($createTableSelectionFrom(table, anchorCell, focusCell));
  });

  fireEvent.contextMenu(screen.getByText("Header A"));

  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: "Merge Cells" }),
    ).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole("button", { name: "Merge Cells" }));

  await waitFor(() => {
    const nextTable = container.querySelector(
      "table",
    ) as HTMLTableElement | null;
    expect(nextTable).not.toBeNull();

    const firstRow = nextTable?.rows.item(0);
    expect(firstRow).not.toBeNull();
    expect((firstRow as HTMLTableRowElement).cells).toHaveLength(1);
    expect((firstRow as HTMLTableRowElement).cells.item(0)?.colSpan).toBe(2);
  });

  fireEvent.contextMenu(screen.getByText(/Header A/));

  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: "Split Cell" }),
    ).toBeInTheDocument();
  });
});

test("applies table actions to the right-clicked cell instead of a stale table selection", async () => {
  let editor: LexicalEditor | null = null;
  const { container } = render(
    <ContextMenuHarness
      onReady={(nextEditor) => {
        editor = nextEditor;
      }}
    />,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const lexicalEditor = getEditorOrThrow(editor);

  lexicalEditor.update(() => {
    const table = $getRoot().getFirstChild();
    if (!$isTableNode(table)) {
      return;
    }

    const firstRow = table.getFirstChild();
    if (!$isTableRowNode(firstRow)) {
      return;
    }

    const firstCell = firstRow.getChildAtIndex(0);
    if ($isTableCellNode(firstCell)) {
      firstCell.selectEnd();
    }
  });

  fireEvent.contextMenu(screen.getByText("Header B"));
  fireEvent.click(
    await screen.findByRole("button", { name: "Insert Column Right" }),
  );

  await waitFor(() => {
    const table = container.querySelector("table") as HTMLTableElement | null;
    expect(table).not.toBeNull();

    const headerRow = table?.rows.item(0);
    expect(headerRow).not.toBeNull();

    const headerCells = [...(headerRow as HTMLTableRowElement).cells].map(
      (cell) => cell.textContent?.trim() ?? "",
    );

    expect(headerCells).toEqual(["Header A", "Header B", ""]);
  });
});

test("hides table actions when right-clicking outside the table after selecting a table cell", async () => {
  let editor: LexicalEditor | null = null;

  render(
    <ContextMenuHarness
      onReady={(nextEditor) => {
        editor = nextEditor;
      }}
    />,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const lexicalEditor = getEditorOrThrow(editor);

  lexicalEditor.update(() => {
    const table = $getRoot().getFirstChild();
    if (!$isTableNode(table)) {
      return;
    }

    const firstRow = table.getFirstChild();
    if (!$isTableRowNode(firstRow)) {
      return;
    }

    const firstCell = firstRow.getChildAtIndex(0);
    if ($isTableCellNode(firstCell)) {
      firstCell.selectEnd();
    }
  });

  fireEvent.contextMenu(screen.getByLabelText("Context menu editor"));

  await waitFor(() => {
    expect(
      screen.queryByRole("button", { name: "Insert Row Above" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Insert Column Right" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete Row" }),
    ).not.toBeInTheDocument();
  });
});

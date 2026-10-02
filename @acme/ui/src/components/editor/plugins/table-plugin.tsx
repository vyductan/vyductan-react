"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {
  EditorThemeClasses,
  Klass,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
} from "lexical";
import type { JSX } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTableNodeWithDimensions,
  $isTableNode,
  INSERT_TABLE_COMMAND,
  TableNode,
} from "@lexical/table";
import { $findMatchingParent } from "@lexical/utils";
import {
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from "lexical";

import { invariant } from "../shared/invariant";

export type InsertTableCommandPayload = Readonly<{
  columns: string;
  rows: string;
  includeHeaders?: boolean;
}>;

export type CellContextShape = {
  cellEditorConfig: null | CellEditorConfig;
  cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
  set: (
    cellEditorConfig: null | CellEditorConfig,
    cellEditorPlugins: null | JSX.Element | Array<JSX.Element>,
  ) => void;
};

export type CellEditorConfig = Readonly<{
  namespace: string;
  nodes?: ReadonlyArray<Klass<LexicalNode>>;
  onError: (error: Error, editor: LexicalEditor) => void;
  readOnly?: boolean;
  theme?: EditorThemeClasses;
}>;

export const INSERT_NEW_TABLE_COMMAND: LexicalCommand<InsertTableCommandPayload> =
  createCommand("INSERT_NEW_TABLE_COMMAND");

export const CellContext = createContext<CellContextShape>({
  cellEditorConfig: null,
  cellEditorPlugins: null,
  set: () => {
    // Empty
  },
});

export function TableContext({ children }: { children: JSX.Element }) {
  const [contextValue, setContextValue] = useState<{
    cellEditorConfig: null | CellEditorConfig;
    cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
  }>({
    cellEditorConfig: null,
    cellEditorPlugins: null,
  });
  return (
    <CellContext.Provider
      value={useMemo(
        () => ({
          cellEditorConfig: contextValue.cellEditorConfig,
          cellEditorPlugins: contextValue.cellEditorPlugins,
          set: (cellEditorConfig, cellEditorPlugins) => {
            setContextValue({ cellEditorConfig, cellEditorPlugins });
          },
        }),
        [contextValue.cellEditorConfig, contextValue.cellEditorPlugins],
      )}
    >
      {children}
    </CellContext.Provider>
  );
}

/**
 * Inserting a table asks nothing, like Notion: a 3×3 table goes in with the
 * caret in its first cell, and rows and columns are added later from the
 * table's "+" handles. Another size is typed into the slash menu: "/2x5".
 */
export const DEFAULT_TABLE_SIZE = { columns: "3", rows: "3" } as const;

// A header row, as GFM requires once the table is saved as markdown. No header
// column: markdown cannot hold one, so a save would quietly drop it.
const DEFAULT_TABLE_HEADERS = { rows: true, columns: false } as const;

export function insertDefaultTable(editor: LexicalEditor): void {
  editor.dispatchCommand(INSERT_TABLE_COMMAND, {
    ...DEFAULT_TABLE_SIZE,
    includeHeaders: DEFAULT_TABLE_HEADERS,
  });

  // Spread it across the width it has, in equal columns, as Notion does. With
  // no widths an empty table is sized by its empty content: three narrow
  // columns. A table someone pastes keeps sizing by what it holds.
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const table = $findMatchingParent(selection.anchor.getNode(), $isTableNode);
    const parent = table?.getParent();
    if (!$isTableNode(table) || !parent) return;

    const container = editor.getElementByKey(parent.getKey());
    if (!container) return;
    const style = getComputedStyle(container);
    const available =
      container.clientWidth -
      Number.parseFloat(style.paddingLeft) -
      Number.parseFloat(style.paddingRight);
    const columns = table.getColumnCount();
    // The collapsed borders take a pixel or two beyond the columns.
    const width = Math.floor((available - 2) / columns);
    if (columns === 0 || width <= 0) return;

    table.setColWidths(Array.from({ length: columns }, () => width));
  });
}

export function TablePlugin({
  cellEditorConfig,
  children,
}: {
  cellEditorConfig: CellEditorConfig;
  children: JSX.Element | Array<JSX.Element>;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const cellContext = useContext(CellContext);

  useEffect(() => {
    if (!editor.hasNodes([TableNode])) {
      invariant(false, "TablePlugin: TableNode is not registered on editor");
    }

    cellContext.set(cellEditorConfig, children);

    return editor.registerCommand<InsertTableCommandPayload>(
      INSERT_NEW_TABLE_COMMAND,
      ({ columns, rows, includeHeaders }) => {
        const tableNode = $createTableNodeWithDimensions(
          Number(rows),
          Number(columns),
          includeHeaders,
        );
        $insertNodes([tableNode]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [cellContext, cellEditorConfig, children, editor]);

  return null;
}

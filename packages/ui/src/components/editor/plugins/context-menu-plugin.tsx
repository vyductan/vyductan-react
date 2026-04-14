/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { TableCellNode } from "@lexical/table";
import type { LexicalNode } from "lexical";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableCellNode,
  $isTableSelection,
  $mergeCells,
  $unmergeCell,
} from "@lexical/table";
import { $findMatchingParent } from "@lexical/utils";
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
} from "lexical";

import { Icon } from "@acme/ui/icons";

import {
  NodeContextMenuOption,
  NodeContextMenuPlugin,
} from "./default/lexical-context-menu-plugin";

function getTableCellFromNode(node: LexicalNode | null): TableCellNode | null {
  if (!node) {
    return null;
  }

  if ($isTableCellNode(node)) {
    return node;
  }

  const tableCell = $findMatchingParent(node, (parentNode) =>
    $isTableCellNode(parentNode),
  );

  return $isTableCellNode(tableCell) ? tableCell : null;
}

function getSelectedTableCell(): TableCellNode | null {
  const selection = $getSelection();

  if ($isRangeSelection(selection)) {
    return getTableCellFromNode(selection.anchor.getNode());
  }

  if ($isTableSelection(selection)) {
    return selection.getNodes().find((node) => $isTableCellNode(node)) ?? null;
  }

  return null;
}

function getMergeSelectionCells(): TableCellNode[] {
  const selection = $getSelection();

  if (!$isTableSelection(selection)) {
    return [];
  }

  return selection
    .getNodes()
    .filter((node): node is TableCellNode => $isTableCellNode(node));
}

function isInTableContext(node: LexicalNode): boolean {
  return getTableCellFromNode(node) !== null;
}

export function ContextMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [contextMenuCellKey, setContextMenuCellKey] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) {
      return;
    }

    const handleContextMenu = (event: MouseEvent) => {
      let nextContextMenuCellKey: string | null = null;

      editor.read(() => {
        const targetNode = $getNearestNodeFromDOMNode(event.target as Node);
        const tableCell = getTableCellFromNode(targetNode);
        nextContextMenuCellKey = tableCell?.getKey() ?? null;
      });

      setContextMenuCellKey(nextContextMenuCellKey);
    };

    rootElement.addEventListener("contextmenu", handleContextMenu);
    return () => {
      rootElement.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [editor]);

  const selectContextMenuTableCell = () => {
    if (!contextMenuCellKey) {
      return false;
    }

    const cellNode = $getNodeByKey(contextMenuCellKey);
    if (!$isTableCellNode(cellNode)) {
      return false;
    }

    cellNode.selectEnd();
    return true;
  };

  const items = [
    new NodeContextMenuOption("Remove Link", {
      icon: <Icon className="size-4" icon="icon-[lucide--unlink]" />,
      $onSelect: () => {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      },
      $showOn: (node: LexicalNode) => {
        if ($isLinkNode(node)) {
          return true;
        }

        const parent = node.getParent();
        return $isLinkNode(parent);
      },
    }),
    new NodeContextMenuOption("Merge Cells", {
      icon: <Icon className="size-4" icon="icon-[lucide--combine]" />,
      $onSelect: () => {
        const cells = getMergeSelectionCells();
        if (cells.length > 1) {
          $mergeCells(cells);
        }
      },
      $showOn: (node: LexicalNode) => {
        if (!isInTableContext(node)) {
          return false;
        }

        return getMergeSelectionCells().length > 1;
      },
    }),
    new NodeContextMenuOption("Split Cell", {
      icon: <Icon className="size-4" icon="icon-[lucide--split]" />,
      $onSelect: () => {
        $unmergeCell();
      },
      $showOn: (node: LexicalNode) => {
        if (!isInTableContext(node)) {
          return false;
        }

        const tableCell = getSelectedTableCell() ?? getTableCellFromNode(node);
        return (
          tableCell !== null &&
          (tableCell.getColSpan() > 1 || tableCell.getRowSpan() > 1)
        );
      },
    }),
    new NodeContextMenuOption("Insert Row Above", {
      icon: <Icon className="size-4" icon="icon-[lucide--arrow-up]" />,
      $onSelect: () => {
        if (selectContextMenuTableCell()) {
          $insertTableRowAtSelection(false);
        }
      },
      $showOn: isInTableContext,
    }),
    new NodeContextMenuOption("Insert Row Below", {
      icon: <Icon className="size-4" icon="icon-[lucide--arrow-down]" />,
      $onSelect: () => {
        if (selectContextMenuTableCell()) {
          $insertTableRowAtSelection(true);
        }
      },
      $showOn: isInTableContext,
    }),
    new NodeContextMenuOption("Insert Column Left", {
      icon: <Icon className="size-4" icon="icon-[lucide--arrow-left]" />,
      $onSelect: () => {
        if (selectContextMenuTableCell()) {
          $insertTableColumnAtSelection(false);
        }
      },
      $showOn: isInTableContext,
    }),
    new NodeContextMenuOption("Insert Column Right", {
      icon: <Icon className="size-4" icon="icon-[lucide--arrow-right]" />,
      $onSelect: () => {
        if (selectContextMenuTableCell()) {
          $insertTableColumnAtSelection(true);
        }
      },
      $showOn: isInTableContext,
    }),
    new NodeContextMenuOption("Delete Row", {
      icon: (
        <Icon className="size-4 text-red-500" icon="icon-[lucide--trash]" />
      ),
      $onSelect: () => {
        if (selectContextMenuTableCell()) {
          $deleteTableRowAtSelection();
        }
      },
      $showOn: isInTableContext,
    }),
    new NodeContextMenuOption("Delete Column", {
      icon: (
        <Icon className="size-4 text-red-500" icon="icon-[lucide--trash]" />
      ),
      $onSelect: () => {
        if (selectContextMenuTableCell()) {
          $deleteTableColumnAtSelection();
        }
      },
      $showOn: isInTableContext,
    }),
  ];

  return (
    <NodeContextMenuPlugin
      items={items}
      className="z-50 flex min-w-[220px] flex-col rounded-lg border border-gray-200 bg-white py-1 shadow-lg outline-none"
      itemClassName="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
    />
  );
}

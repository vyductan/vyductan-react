"use client";

import { useEffect, useState } from "react";
import { $isListNode, ListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode } from "@lexical/rich-text";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_CRITICAL,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

import { blockTypeToBlockName } from "../plugins/toolbar/block-format/block-format-data";

/**
 * Hook to detect the current block type in the Lexical editor
 * @returns The current block type (e.g., "h1", "h2", "paragraph", "bullet", etc.)
 */
export function useBlockType(): string {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState<string>("paragraph");

  useEffect(() => {
    const updateBlockType = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          let element =
            anchorNode.getKey() === "root"
              ? anchorNode
              : $findMatchingParent(anchorNode, (e) => {
                  const parent = e.getParent();
                  return parent !== null && $isRootOrShadowRoot(parent);
                });

          element ??= anchorNode.getTopLevelElementOrThrow();

          const elementKey = element.getKey();
          const elementDOM = editor.getElementByKey(elementKey);

          if (elementDOM !== null) {
            if ($isListNode(element)) {
              const parentList = $getNearestNodeOfType<ListNode>(
                anchorNode,
                ListNode,
              );
              const type = parentList
                ? parentList.getListType()
                : element.getListType();
              if (type in blockTypeToBlockName) {
                setBlockType(type);
              }
            } else {
              const type = $isHeadingNode(element)
                ? element.getTag()
                : element.getType();
              if (type in blockTypeToBlockName) {
                setBlockType(type);
              } else {
                // Default to paragraph if type not found
                setBlockType("paragraph");
              }
            }
          }
        } else {
          // If no range selection, default to paragraph
          setBlockType("paragraph");
        }
      });
    };

    // Initial update
    updateBlockType();

    // Listen to selection changes
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateBlockType();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

  return blockType;
}

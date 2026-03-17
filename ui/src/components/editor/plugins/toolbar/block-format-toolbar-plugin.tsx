"use client";

import type { HeadingTagType } from "@lexical/rich-text";
import type { BaseSelection } from "lexical";
import { $createCodeNode } from "@lexical/code";
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
} from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
} from "lexical";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@acme/ui/components/select";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
} from "@acme/ui/components/select";

import { useToolbarContext } from "../../context/toolbar-context";
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar";
import { blockTypeToBlockName } from "../../plugins/toolbar/block-format/block-format-data";
import { FormatBulletedList } from "./block-format/format-bulleted-list";
import { FormatCheckList } from "./block-format/format-check-list";
import { FormatCodeBlock } from "./block-format/format-code-block";
import { FormatHeading } from "./block-format/format-heading";
import { FormatNumberedList } from "./block-format/format-numbered-list";
import { FormatParagraph } from "./block-format/format-paragraph";
import { FormatQuote } from "./block-format/format-quote";

// Need $isHeadingNode for the check above
function $isHeadingNode(node: unknown): node is { getTag: () => string } {
  return (
    typeof node === "object" &&
    node !== null &&
    "__type" in node &&
    (node as { __type: string }).__type === "heading"
  );
}

export function BlockFormatDropDown() {
  const { activeEditor, blockType, setBlockType } = useToolbarContext();

  function $updateToolbar(selection: BaseSelection) {
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

      const elementDOM = activeEditor.getElementByKey(element.getKey());

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : (element as ListNode).getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) // Check if import is available or use generic check
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type);
          }
        }
      }
    }
  }

  useUpdateToolbarHandler($updateToolbar);

  const formatParagraph = () => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const handleBlockTypeChange = (value: string) => {
    // If format was already handled by onSelect (if we used it), don't update blockType
    // But we are moving logic here, so we process it.

    // Validate that value is a valid blockType before updating
    const validBlockTypes = [
      "paragraph",
      "h1",
      "h2",
      "h3",
      "bullet",
      "number",
      "check",
      "code",
      "quote",
    ];
    if (!validBlockTypes.includes(value)) {
      return;
    }

    setBlockType(value);

    switch (value) {
      case "paragraph": {
        formatParagraph();
        break;
      }
      case "h1":
      case "h2":
      case "h3": {
        activeEditor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () =>
              $createHeadingNode(value as HeadingTagType),
            );
          }
        });
        break;
      }
      case "bullet": {
        if (blockType === "bullet") {
          formatParagraph();
        } else {
          activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0);
        }
        break;
      }
      case "number": {
        if (blockType === "number") {
          formatParagraph();
        } else {
          activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0);
        }
        break;
      }
      case "check": {
        if (blockType === "check") {
          formatParagraph();
        } else {
          activeEditor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, void 0);
        }
        break;
      }
      case "quote": {
        activeEditor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        });
        break;
      }
      case "code": {
        activeEditor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createCodeNode());
          }
        });
        break;
      }
    }
  };

  // Only show Paragraph and Headings
  const allowedBlockTypes = new Set([
    "paragraph",
    "h1",
    "h2",
    "h3",
    "bullet",
    "number",
    "check",
    "code",
    "quote",
  ]);

  return (
    <Select value={blockType} onValueChange={handleBlockTypeChange}>
      <SelectTrigger className="h-8 w-min gap-1">
        {blockTypeToBlockName[blockType]?.icon}
        <span>{blockTypeToBlockName[blockType]?.label}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {/* Inline items instead of children */}
          {Object.entries(blockTypeToBlockName)
            .filter(([key]) => allowedBlockTypes.has(key))
            .map(([key, value]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-1 font-normal">
                  {value.icon}
                  {value.label}
                </div>
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

/**
 * Block Format Toolbar Plugin
 * Wrapper component để sử dụng BlockFormatDropDown với tất cả format options
 */
export function BlockFormatToolbarPlugin({
  blockType: _blockType,
}: {
  blockType: string;
}) {
  return <BlockFormatDropDown />;
}

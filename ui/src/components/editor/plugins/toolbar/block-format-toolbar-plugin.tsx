"use client";

import type { BaseSelection } from "lexical";
import {
  SelectContent,
  SelectGroup,
  SelectRoot,
  SelectTrigger,
} from "@/components/ui/select";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import { $isRangeSelection, $isRootOrShadowRoot } from "lexical";

import { useToolbarContext } from "../../context/toolbar-context";
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar";
import { blockTypeToBlockName } from "../../plugins/toolbar/block-format/block-format-data";
import { FormatParagraph } from "./block-format/format-paragraph";
import { FormatHeading } from "./block-format/format-heading";
import { FormatBulletedList } from "./block-format/format-bulleted-list";
import { FormatNumberedList } from "./block-format/format-numbered-list";
import { FormatCheckList } from "./block-format/format-check-list";
import { FormatCodeBlock } from "./block-format/format-code-block";
import { FormatQuote } from "./block-format/format-quote";

export function BlockFormatDropDown({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeEditor, blockType, setBlockType, formatHandledRef } = useToolbarContext();

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

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        // setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
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

  return (
    <SelectRoot
      value={blockType}
      onValueChange={(value) => {
        // If format was already handled by onSelect, don't update blockType
        // This prevents the value "bullet" from being set when user clicks on SelectItem
        if (formatHandledRef.current) {
          formatHandledRef.current = false;
          return;
        }
        
        // Validate that value is a valid blockType before updating
        const validBlockTypes = ["paragraph", "h1", "h2", "h3", "bullet", "number", "check", "code", "quote"];
        if (!validBlockTypes.includes(value)) {
          return;
        }
        
        // Only update blockType if it's different from current value
        if (value !== blockType) {
          setBlockType(value);
        }
      }}
    >
      <SelectTrigger className="h-8 w-min gap-1">
        {blockTypeToBlockName[blockType]?.icon}
        <span>{blockTypeToBlockName[blockType]?.label}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>{children}</SelectGroup>
      </SelectContent>
    </SelectRoot>
  );
}

/**
 * Block Format Toolbar Plugin
 * Wrapper component để sử dụng BlockFormatDropDown với tất cả format options
 */
export function BlockFormatToolbarPlugin({
  blockType,
}: {
  blockType: string;
}) {
  return (
    <BlockFormatDropDown>
      <FormatParagraph />
      <FormatHeading levels={["h1", "h2", "h3"]} />
      <FormatBulletedList />
      <FormatNumberedList />
      <FormatCheckList />
      <FormatCodeBlock />
      <FormatQuote />
    </BlockFormatDropDown>
  );
}

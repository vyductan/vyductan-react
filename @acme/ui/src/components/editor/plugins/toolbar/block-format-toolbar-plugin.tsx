"use client";

import type { HeadingTagType } from "@lexical/rich-text";
import type { BaseSelection } from "lexical";
import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from "lexical";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@acme/ui/components/select";
import { cn } from "@acme/ui/lib/utils";

import { useToolbarContext } from "../../context/toolbar-context";
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar";
import { $resolveBlockType } from "../../utils/resolve-block-type";
import { blockTypeToBlockName } from "./block-format-data";

export function BlockFormatDropDown() {
  const { activeEditor, blockType, setBlockType } = useToolbarContext();

  function $updateToolbar(selection: BaseSelection) {
    const type = $resolveBlockType(selection, (key) =>
      activeEditor.getElementByKey(key),
    );
    if (type !== null) {
      setBlockType(type);
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

  const selectableTypes = Object.entries(blockTypeToBlockName).filter(([key]) =>
    allowedBlockTypes.has(key),
  );
  const activeLabel = blockTypeToBlockName[blockType]?.label;

  return (
    <Select value={blockType} onValueChange={handleBlockTypeChange}>
      <SelectTrigger className="h-8 w-min gap-1">
        {blockTypeToBlockName[blockType]?.icon}
        {/*
          Sizing the trigger to its current label made the whole toolbar slide
          sideways whenever the caret crossed from a paragraph into a heading
          ("Numbered List" is 28px wider than "Paragraph"). Every label is laid
          out in one grid cell so the width settles on the widest of them, which
          keeps holding once these strings are translated — a fixed px width
          would not.
        */}
        <span className="grid">
          {selectableTypes.map(([key, value]) => (
            <span
              aria-hidden={value.label !== activeLabel}
              className={cn(
                "col-start-1 row-start-1 text-left",
                value.label !== activeLabel && "invisible",
              )}
              key={key}
            >
              {value.label}
            </span>
          ))}
        </span>
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          {/* Inline items instead of children */}
          {selectableTypes.map(([key, value]) => (
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

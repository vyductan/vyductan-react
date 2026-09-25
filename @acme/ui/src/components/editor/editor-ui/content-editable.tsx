import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";
import { $getRoot, $isParagraphNode } from "lexical";

import { cn } from "@acme/ui/lib/utils";

import { useBlockType } from "../editor-hooks/use-block-type";
import { blockTypeToBlockName } from "../plugins/toolbar/block-format-data";
import { editorTheme } from "../themes/editor-theme";

/** Shared by the editable and its placeholder so the two cannot drift. */
const CONTENT_PADDING = "px-12 py-4";

type Properties = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
};

/**
 * Maps block type to placeholder text
 * Uses blockTypeToBlockName to get the label for the block type
 */
function getPlaceholderForBlockType(
  blockType: string,
  defaultPlaceholder: string,
): string {
  // For paragraph, use the default placeholder
  if (blockType === "paragraph") {
    return defaultPlaceholder;
  }

  // Get label from blockTypeToBlockName
  const blockInfo = blockTypeToBlockName[blockType];
  if (blockInfo?.label) {
    return blockInfo.label;
  }

  // Fallback to default if block type not found
  return defaultPlaceholder;
}

/**
 * The theme classes of the block the caret is in, for the placeholder's text.
 *
 * They go on an inner element, not on the positioned box: the caret sits inside
 * the first block, and that block's theme gives it a vertical margin (a
 * paragraph is `my-1.5`). Without the same block around the prompt, the prompt
 * rendered one margin above the caret.
 */
function getPlaceholderBlockClassName(blockType: string): string {
  if (editorTheme.heading && blockType in editorTheme.heading) {
    return (
      editorTheme.heading[blockType as keyof typeof editorTheme.heading] ?? ""
    );
  }
  if (blockType === "quote" && editorTheme.quote) return editorTheme.quote;
  return editorTheme.paragraph ?? "";
}

// Inset to the box, then padded like the editable itself, rather than offset
// by a hard-coded copy of that padding: the prompt has to start exactly where
// the caret will, and a second literal of the same number drifts the moment a
// consumer retunes contentClassName.
const PLACEHOLDER_BOX =
  "text-muted-foreground pointer-events-none absolute inset-0 select-none";

// The focused empty line's prompt (BlockPlaceholderPlugin sets the attribute).
// A zero-height float: it takes no room, so the caret stays at the line's
// start and the prompt sits under it rather than pushing it right.
//
// A checklist item's ::before is its checkbox, so there the prompt is ::after,
// taken out of flow: after the item's <br> it would start a line of its own,
// but absolutely placed it keeps the line's start as its static left edge and
// only needs pulling up to the top.
const BLOCK_PLACEHOLDER = cn(
  "[&_[data-placeholder]:not([role=checkbox])]:before:content-[attr(data-placeholder)]",
  "[&_[data-placeholder]:not([role=checkbox])]:before:text-muted-foreground",
  "[&_[data-placeholder]:not([role=checkbox])]:before:pointer-events-none",
  "[&_[data-placeholder]:not([role=checkbox])]:before:float-left",
  "[&_[data-placeholder]:not([role=checkbox])]:before:h-0",
  "[&_[data-placeholder]:not([role=checkbox])]:before:select-none",
  "[&_[data-placeholder][role=checkbox]]:after:content-[attr(data-placeholder)]",
  "[&_[data-placeholder][role=checkbox]]:after:text-muted-foreground",
  "[&_[data-placeholder][role=checkbox]]:after:pointer-events-none",
  "[&_[data-placeholder][role=checkbox]]:after:absolute",
  "[&_[data-placeholder][role=checkbox]]:after:top-0",
  "[&_[data-placeholder][role=checkbox]]:after:select-none",
);

// Blocks under a multi-block selection (BlockSelectionPlugin), highlighted
// whole in Notion's blue, with the text highlight inside them turned off.
const BLOCK_SELECTION = cn(
  "[&_[data-block-selected]]:rounded-sm",
  "[&_[data-block-selected]]:bg-[rgb(35_131_226/0.14)]",
  "[&_[data-block-selected]]:selection:bg-transparent",
);

export function ContentEditable({
  placeholder = "Start typing...",
  className,
  placeholderClassName,
}: Properties): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const blockType = useBlockType();
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const updateIsEmpty = () => {
      editor.getEditorState().read(() => {
        const children = $getRoot().getChildren();

        // Emptiness is structural, not textual. Typing `1. ` turns the paragraph
        // into a list whose only item has no text yet — text-only emptiness kept
        // reporting empty there, so the placeholder sat on top of the list the
        // author had just created. The same held for an empty quote or code block.
        const firstChild = children[0];
        setIsEmpty(
          children.length === 0 ||
            (children.length === 1 &&
              firstChild !== undefined &&
              $isParagraphNode(firstChild) &&
              firstChild.getTextContentSize() === 0),
        );
      });
    };

    // Initial check
    updateIsEmpty();

    // Listen to editor updates
    return editor.registerUpdateListener(() => {
      updateIsEmpty();
    });
  }, [editor]);

  const dynamicPlaceholder = getPlaceholderForBlockType(blockType, placeholder);

  return (
    <div className="relative">
      {isEmpty && dynamicPlaceholder && (
        <div
          data-slot="editor-placeholder"
          className={cn(
            PLACEHOLDER_BOX,
            CONTENT_PADDING,
            // The same class the editable gets, so a retuned padding or text
            // size moves both together.
            className,
            placeholderClassName,
          )}
        >
          <div className={getPlaceholderBlockClassName(blockType)}>
            {dynamicPlaceholder}
          </div>
        </div>
      )}
      <LexicalContentEditable
        style={{
          unicodeBidi: "plaintext",
        }}
        className={cn(
          CONTENT_PADDING,
          "wrap-break-word whitespace-break-spaces focus:outline-none",
          BLOCK_PLACEHOLDER,
          BLOCK_SELECTION,
          className,
        )}
        aria-placeholder={dynamicPlaceholder}
        placeholder={() => null}
      />
    </div>
  );
}

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
 * Maps block type to placeholder styling className
 * Reuses classes from editorTheme to avoid duplication
 */
function getPlaceholderClassName(blockType: string): string {
  // Inset to the box, then padded like the editable itself, rather than offset
  // by a hard-coded copy of that padding: the prompt has to start exactly where
  // the caret will, and a second literal of the same number drifts the moment a
  // consumer retunes contentClassName.
  const baseClasses =
    "text-muted-foreground pointer-events-none absolute inset-0 select-none";

  // Get theme classes for the block type
  let themeClasses = "";
  if (editorTheme.heading && blockType in editorTheme.heading) {
    themeClasses =
      editorTheme.heading[blockType as keyof typeof editorTheme.heading] ?? "";
  } else if (blockType === "quote" && editorTheme.quote) {
    themeClasses = editorTheme.quote;
  }

  // Combine base classes with theme classes
  return cn(baseClasses, themeClasses);
}

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
            getPlaceholderClassName(blockType),
            CONTENT_PADDING,
            // The same class the editable gets, so a retuned padding or text
            // size moves both together.
            className,
            placeholderClassName,
          )}
        >
          {dynamicPlaceholder}
        </div>
      )}
      <LexicalContentEditable
        style={{
          unicodeBidi: "plaintext",
        }}
        className={cn(
          CONTENT_PADDING,
          "wrap-break-word whitespace-break-spaces focus:outline-none",
          className,
        )}
        aria-placeholder={dynamicPlaceholder}
        placeholder={() => null}
      />
    </div>
  );
}

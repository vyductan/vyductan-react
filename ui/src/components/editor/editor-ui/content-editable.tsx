import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";
import { $getRoot } from "lexical";

import { cn } from "@acme/ui/lib/utils";

import { useBlockType } from "../editor-hooks/use-block-type";
import { blockTypeToBlockName } from "../plugins/toolbar/block-format/block-format-data";
import { editorTheme } from "../themes/editor-theme";

type Props = {
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
  const baseClasses =
    "pointer-events-none absolute left-12 top-4 text-gray-400 select-none";

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
}: Props): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const blockType = useBlockType();
  const [isEmpty, setIsEmpty] = useState(true);

  // Check if editor is empty
  useEffect(() => {
    const updateIsEmpty = () => {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent().trim();
        setIsEmpty(textContent === "");
      });
    };

    // Initial check
    updateIsEmpty();

    // Listen to editor updates
    return editor.registerUpdateListener(() => {
      updateIsEmpty();
    });
  }, [editor]);

  // Calculate dynamic placeholder based on block type
  const dynamicPlaceholder = getPlaceholderForBlockType(blockType, placeholder);

  return (
    <div className="relative">
      {isEmpty && dynamicPlaceholder && (
        <div
          className={cn(
            getPlaceholderClassName(blockType),
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
          "px-12 py-4 text-sm wrap-break-word whitespace-break-spaces focus:outline-none",
          className,
        )}
        aria-placeholder={dynamicPlaceholder}
        placeholder={() => null}
      />
    </div>
  );
}

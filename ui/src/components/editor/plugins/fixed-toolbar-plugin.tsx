"use client";

/**
 * Fixed Toolbar Plugin
 *
 * Toolbar cố định ở trên editor với các tính năng formatting đầy đủ:
 * - Font formatting (size, color, family, background)
 * - Text alignment
 * - Subscript/Superscript
 * - History (undo/redo)
 * - Link
 */
import { Separator } from "@acme/ui/components/divider";

import { ExportPlugin } from "./export-plugin";
import { FullscreenPlugin } from "./fullscreen-plugin";
import { BlockFormatToolbarPlugin } from "./toolbar/block-format-toolbar-plugin";
import { ElementFormatToolbarPlugin } from "./toolbar/element-format-toolbar-plugin";
import { FontBackgroundToolbarPlugin } from "./toolbar/font-background-toolbar-plugin";
import { FontColorToolbarPlugin } from "./toolbar/font-color-toolbar-plugin";
import { FontFamilyToolbarPlugin } from "./toolbar/font-family-toolbar-plugin";
import { FontFormatToolbarPlugin } from "./toolbar/font-format-toolbar-plugin";
import { FontSizeToolbarPlugin } from "./toolbar/font-size-toolbar-plugin";
import { HistoryToolbarPlugin } from "./toolbar/history-toolbar-plugin";
import { LinkToolbarPlugin } from "./toolbar/link-toolbar-plugin";
import { SubSuperToolbarPlugin } from "./toolbar/subsuper-toolbar-plugin";
import { ToolbarPlugin } from "./toolbar/toolbar-plugin";

interface FixedToolbarPluginProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function FixedToolbarPlugin({ containerRef }: FixedToolbarPluginProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-2 shadow-sm">
      <ToolbarPlugin>
        {({ blockType }) => (
          <div className="flex flex-wrap items-center gap-2">
            {/* History (Undo/Redo) */}
            <HistoryToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Block Format (Headings, Lists, etc.) */}
            <BlockFormatToolbarPlugin blockType={blockType} />

            <Separator orientation="vertical" className="h-6" />

            {/* Text Formatting (Bold, Italic, etc.) */}
            <FontFormatToolbarPlugin format="bold" />
            <FontFormatToolbarPlugin format="italic" />
            <FontFormatToolbarPlugin format="underline" />
            <FontFormatToolbarPlugin format="strikethrough" />
            <FontFormatToolbarPlugin format="code" />

            <Separator orientation="vertical" className="h-6" />

            {/* Font Size */}
            <FontSizeToolbarPlugin />

            {/* Font Family */}
            <FontFamilyToolbarPlugin />

            {/* Font Color */}
            <FontColorToolbarPlugin />

            {/* Background Color */}
            <FontBackgroundToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Subscript/Superscript */}
            <SubSuperToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Text Alignment */}
            <ElementFormatToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Link */}
            <LinkToolbarPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Export */}
            <ExportPlugin />

            <Separator orientation="vertical" className="h-6" />

            {/* Fullscreen */}
            <FullscreenPlugin containerRef={containerRef} />
          </div>
        )}
      </ToolbarPlugin>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { useRef, useState } from "react";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";

import { ContentEditable } from "../editor-ui/content-editable";
import { AutoLinkPlugin } from "../plugins/auto-link-plugin";
import { CodeActionMenuPlugin } from "../plugins/code-action-menu-plugin";
import { CodeHighlightPlugin } from "../plugins/code-highlight-plugin";
import { BlockTypeNormalizationPlugin } from "../plugins/blocktype-normalization-plugin";
import { CollapsiblePlugin } from "../plugins/collapsible-plugin";
import { ComponentPickerMenuPlugin } from "../plugins/component-picker-plugin";
import { ContextMenuPlugin } from "../plugins/context-menu-plugin";
import { DragDropPastePlugin } from "../plugins/drag-drop-paste-plugin";
import { DraggableBlockPlugin } from "../plugins/draggable-block-plugin";
import { AutoEmbedPlugin } from "../plugins/embeds/auto-embed-plugin";
import { FigmaPlugin } from "../plugins/embeds/figma-plugin";
import { InstagramPlugin } from "../plugins/embeds/instagram-plugin";
import { TikTokPlugin } from "../plugins/embeds/tiktok-plugin";
import { TwitterPlugin } from "../plugins/embeds/twitter-plugin";
import { YouTubePlugin } from "../plugins/embeds/youtube-plugin";
import { EmojiPickerPlugin } from "../plugins/emoji-picker-plugin";
import { EmojisPlugin } from "../plugins/emojis-plugin";
import { EquationsPlugin } from "../plugins/equations-plugin";
import { ExcalidrawPlugin } from "../plugins/excalidraw-plugin";
import { FileAttachmentPlugin } from "../plugins/file-attachment-plugin";
import { FindReplacePlugin } from "../plugins/find-replace-plugin";
import { FixedToolbarPlugin } from "../plugins/fixed-toolbar-plugin";
import { FloatingLinkEditorPlugin } from "../plugins/floating-link-editor-plugin";
import { FloatingTextFormatToolbarPlugin } from "../plugins/floating-text-format-toolbar-plugin";
import { ImagesPlugin } from "../plugins/images-plugin";
import { KeywordsPlugin } from "../plugins/keywords-plugin";
import { KeyboardShortcutsHelpPlugin } from "../plugins/keyboard-shortcuts-help-plugin";
import { LayoutPlugin } from "../plugins/layout-plugin";
import { LinkPlugin } from "../plugins/link-plugin";
import { ListMaxIndentLevelPlugin } from "../plugins/list-max-indent-level-plugin";
import { MentionsPlugin } from "../plugins/mentions-plugin";
import { PageBreakPlugin } from "../plugins/page-break-plugin";
import { PollPlugin } from "../plugins/poll-plugin";
import { TabFocusPlugin } from "../plugins/tab-focus-plugin";
import { TableActionsPlugin } from "../plugins/table-actions-plugin";
import { TOCPlugin } from "../plugins/toc-plugin";
import { VideoPlugin } from "../plugins/video-plugin";
import { MARKDOWN_TRANSFORMERS } from "../transformers/markdown-transformers";

export function Plugins({
  placeholder = "Type '/' for commands, or 'Ctrl+/' for shortcuts",
}: {
  placeholder?: string;
}) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div
      ref={containerRef}
      className="editor-scroll-container relative min-h-[300px] sm:min-h-[400px] overflow-auto bg-white rounded-lg transition-colors"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(156, 163, 175, 0) transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.scrollbarColor =
          "rgba(156, 163, 175, 0.5) transparent";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.scrollbarColor =
          "rgba(156, 163, 175, 0) transparent";
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .editor-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .editor-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .editor-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0);
          border-radius: 3px;
          transition: background 0.2s ease;
        }
        .editor-scroll-container:hover::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
        }
        .editor-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `,
        }}
      />
      {/* Fixed Toolbar - Toolbar cố định ở trên editor */}
      <FixedToolbarPlugin containerRef={containerRef} />

      <AutoFocusPlugin />
      <RichTextPlugin
        contentEditable={
          <div className="group" ref={onRef}>
            <ContentEditable
              className="pl-6 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-3 focus:outline-none font-sans text-sm sm:text-[15px] leading-6 sm:leading-7 min-h-[200px] transition-colors"
              placeholder={placeholder}
              placeholderClassName="text-gray-400 pointer-events-none absolute top-2 sm:top-3 left-6 sm:left-8 overflow-hidden leading-6 sm:leading-7 text-ellipsis select-none whitespace-nowrap transition-colors max-w-[calc(100%-3rem)] sm:max-w-[calc(100%-4rem)]"
            />
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />

      <ClickableLinkPlugin />
      <CheckListPlugin />
      <HorizontalRulePlugin />
      <TablePlugin />
      <TableActionsPlugin anchorElem={floatingAnchorElem} />
      <TOCPlugin />
      <ListPlugin />
      <TabIndentationPlugin />
      <HashtagPlugin />
      <HistoryPlugin />
      <BlockTypeNormalizationPlugin />

      <MentionsPlugin />
      <PageBreakPlugin />
      <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
      <KeywordsPlugin />
      <EmojisPlugin />
      <ImagesPlugin />
      <VideoPlugin />
      <FileAttachmentPlugin />
      <ExcalidrawPlugin />
      <PollPlugin />
      <LayoutPlugin />
      <EquationsPlugin />
      <CollapsiblePlugin />

      <AutoEmbedPlugin />
      <FigmaPlugin />
      <YouTubePlugin />
      <TwitterPlugin />
      <InstagramPlugin />
      <TikTokPlugin />

      <CodeHighlightPlugin />
      <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />

      {/* Tắt MarkdownShortcutPlugin để tránh tự động thay đổi text khi gõ markdown syntax */}
      {/* <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} /> */}
      {/* <TypingPerfPlugin /> */}
      <TabFocusPlugin />
      <AutoLinkPlugin />
      <LinkPlugin />
      <FindReplacePlugin />

      {/* ComponentPickerMenuPlugin - ĐÃ TẮT để tránh tự động thay đổi text khi gõ "/" */}
      {/* <ComponentPickerMenuPlugin /> */}
      <ContextMenuPlugin />
      <DragDropPastePlugin />
      <EmojiPickerPlugin />

      <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
      <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />

      <KeyboardShortcutsHelpPlugin />
      <ListMaxIndentLevelPlugin />
    </div>
  );
}

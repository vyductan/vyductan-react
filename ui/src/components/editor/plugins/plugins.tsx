import { useEffect, useRef, useState } from "react";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";

import { cn } from "@acme/ui/lib/utils";

import type { SizeType } from "../../config-provider/size-context";
import type { MentionData } from "../plugins/mentions-plugin";
import { ContentEditable } from "../editor-ui/content-editable";
import { AutoLinkPlugin } from "../plugins/auto-link-plugin";
import { BlockCopyPastePlugin } from "../plugins/block-copy-paste-plugin";
import { BlockTypeNormalizationPlugin } from "../plugins/blocktype-normalization-plugin";
import { CheckBlockPlugin } from "../plugins/check-block-plugin";
import { CodeActionMenuPlugin } from "../plugins/code-action-menu-plugin";
import { CodeHighlightPlugin } from "../plugins/code-highlight-plugin";
import { CollapsiblePlugin } from "../plugins/collapsible-plugin";
import { ComponentPickerMenuPlugin } from "../plugins/component-picker-plugin";
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
import { FloatingLinkEditorPlugin } from "../plugins/floating-link-editor-plugin";
import { FloatingTextFormatToolbarPlugin } from "../plugins/floating-text-format-toolbar-plugin";
import { ImagesPlugin } from "../plugins/images-plugin";
import { KeyboardShortcutsHelpPlugin } from "../plugins/keyboard-shortcuts-help-plugin";
import { KeywordsPlugin } from "../plugins/keywords-plugin";
import { LayoutPlugin } from "../plugins/layout-plugin";
import { LinkPlugin } from "../plugins/link-plugin";
import { ListMaxIndentLevelPlugin } from "../plugins/list-max-indent-level-plugin";
import { MarkdownPastePlugin } from "../plugins/markdown-paste-plugin";
import { MentionsPlugin } from "../plugins/mentions-plugin";
import { PageBreakPlugin } from "../plugins/page-break-plugin";
import { PollPlugin } from "../plugins/poll-plugin";
import { TabFocusPlugin } from "../plugins/tab-focus-plugin";
import { TableActionsPlugin } from "../plugins/table-actions-plugin";
import { TOCPlugin } from "../plugins/toc-plugin";
import { VideoPlugin } from "../plugins/video-plugin";
import { MARKDOWN_TRANSFORMERS } from "../transformers/markdown-transformers";

// import { EditorDebugViewPlugin } from "./actions/editor-debug-view-plugin";

export function Plugins({
  placeholder = "Write, press ‘space’ for AI, ‘/’ for commands…",
  onImageUpload,
  editable = true,
  variant = "default",
  mentionsData,
  className,
  contentClassName,
  placeholderClassName,
  autoFocus,
  size = "middle",
}: {
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
  editable?: boolean;
  variant?: "default" | "simple";
  mentionsData?: MentionData[];
  className?: string;
  contentClassName?: string;
  placeholderClassName?: string;
  autoFocus?: boolean;
  size?: SizeType;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);

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
      className={cn(
        "editor-scroll-container relative transition-colors",
        editable
          ? "min-h-[300px] overflow-y-auto sm:min-h-[400px]"
          : "min-h-0 overflow-visible",
        className,
      )}
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
      {/* <FixedToolbarPlugin containerRef={containerRef} /> */}
      {/* <FixedToolbarPlugin containerRef={containerRef} /> */}

      {autoFocus && editable && <AutoFocusPlugin />}
      <RichTextPlugin
        contentEditable={
          <div className="group relative" ref={onRef}>
            <ContentEditable
              className={cn(
                contentClassName,
                size === "small" ? "text-sm" : "text-base",
              )}
              placeholderClassName={placeholderClassName}
              // className="py-[3px] px-0.5 text-sm wrap-break-word whitespace-break-spaces"
              placeholder={editable ? placeholder : ""}
              // placeholderClassName="text-gray-400 pointer-events-none absolute top-2.5 sm:top-3.5 left-2 sm:left-4 overflow-hidden leading-6 sm:leading-7 text-ellipsis select-none whitespace-nowrap transition-colors max-w-[calc(100%-3rem)] sm:max-w-[calc(100%-4rem)]"
            />
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />

      <ClickableLinkPlugin />
      <CheckListPlugin />
      {variant !== "simple" && editable && <BlockCopyPastePlugin />}
      <CheckBlockPlugin />
      <HorizontalRulePlugin />
      <TablePlugin />
      <TablePlugin />
      {variant !== "simple" && editable && (
        <TableActionsPlugin anchorElem={floatingAnchorElem} />
      )}
      <TOCPlugin />
      <ListPlugin />
      <TabIndentationPlugin />
      {variant !== "simple" && <HashtagPlugin />}
      <HistoryPlugin />
      <BlockTypeNormalizationPlugin />

      <MentionsPlugin mentionsData={mentionsData} />
      {variant !== "simple" && <PageBreakPlugin />}
      {variant !== "simple" && editable && (
        <DraggableBlockPlugin anchorElem={floatingAnchorElem} size={size} />
      )}
      {variant !== "simple" && <KeywordsPlugin />}
      <EmojisPlugin />
      {variant !== "simple" && <ImagesPlugin />}
      {variant !== "simple" && <VideoPlugin />}
      {variant !== "simple" && <FileAttachmentPlugin />}
      {variant !== "simple" && <ExcalidrawPlugin />}
      {variant !== "simple" && <PollPlugin />}
      {variant !== "simple" && <LayoutPlugin />}
      {variant !== "simple" && <EquationsPlugin />}
      {variant !== "simple" && <CollapsiblePlugin />}

      {variant !== "simple" && <AutoEmbedPlugin />}
      {variant !== "simple" && <FigmaPlugin />}
      {variant !== "simple" && <YouTubePlugin />}
      {variant !== "simple" && <TwitterPlugin />}
      {variant !== "simple" && <InstagramPlugin />}
      {variant !== "simple" && <TikTokPlugin />}

      <CodeHighlightPlugin />
      {variant !== "simple" && editable && (
        <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
      )}

      {/* MarkdownShortcutPlugin enabled for checklist support (- [ ]) */}
      <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
      {/* <TypingPerfPlugin /> */}
      <TabFocusPlugin />
      <AutoLinkPlugin />
      <LinkPlugin />
      <FindReplacePlugin />

      {/* ComponentPickerMenuPlugin - Slash commands like Not ion */}
      {variant !== "simple" && editable && <ComponentPickerMenuPlugin />}
      {/* <ContextMenuPlugin /> */}
      {variant !== "simple" && editable && (
        <DragDropPastePlugin
          onImageUpload={onImageUpload}
          anchorElem={floatingAnchorElem ?? undefined}
        />
      )}
      {editable && <MarkdownPastePlugin />}
      {editable && <EmojiPickerPlugin />}

      {editable && <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />}
      {editable && (
        <FloatingTextFormatToolbarPlugin
          anchorElem={floatingAnchorElem}
          variant={variant}
        />
      )}

      <KeyboardShortcutsHelpPlugin />
      {editable && <ListMaxIndentLevelPlugin />}
      {/* <EditorDebugViewPlugin /> */}
    </div>
  );
}

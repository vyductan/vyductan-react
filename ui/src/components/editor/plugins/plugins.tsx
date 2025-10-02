/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
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

import { Separator } from "../../divider";
import { ContentEditable } from "../editor-ui/content-editable";
import { ActionsPlugin } from "../plugins/actions/actions-plugin";
import { CharacterLimitPlugin } from "../plugins/actions/character-limit-plugin";
import { ClearEditorActionPlugin } from "../plugins/actions/clear-editor-plugin";
import { EditModeTogglePlugin } from "../plugins/actions/edit-mode-toggle-plugin";
import { ImportExportPlugin } from "../plugins/actions/import-export-plugin";
import { MarkdownTogglePlugin } from "../plugins/actions/markdown-toggle-plugin";
import { MaxLengthPlugin } from "../plugins/actions/max-length-plugin";
import { ShareContentPlugin } from "../plugins/actions/share-content-plugin";
import { SpeechToTextPlugin } from "../plugins/actions/speech-to-text-plugin";
import { TreeViewPlugin } from "../plugins/actions/tree-view-plugin";
import { AutoLinkPlugin } from "../plugins/auto-link-plugin";
import { AutocompletePlugin } from "../plugins/autocomplete-plugin";
import { CodeActionMenuPlugin } from "../plugins/code-action-menu-plugin";
import { CodeHighlightPlugin } from "../plugins/code-highlight-plugin";
import { CollapsiblePlugin } from "../plugins/collapsible-plugin";
import { ComponentPickerMenuPlugin } from "../plugins/component-picker-plugin";
import { ContextMenuPlugin } from "../plugins/context-menu-plugin";
import { DragDropPastePlugin } from "../plugins/drag-drop-paste-plugin";
import { DraggableBlockPlugin } from "../plugins/draggable-block-plugin";
import { AutoEmbedPlugin } from "../plugins/embeds/auto-embed-plugin";
import { FigmaPlugin } from "../plugins/embeds/figma-plugin";
import { YouTubePlugin } from "../plugins/embeds/youtube-plugin";
import { EmojiPickerPlugin } from "../plugins/emoji-picker-plugin";
import { EmojisPlugin } from "../plugins/emojis-plugin";
import { EquationsPlugin } from "../plugins/equations-plugin";
import { ExcalidrawPlugin } from "../plugins/excalidraw-plugin";
import { FloatingLinkEditorPlugin } from "../plugins/floating-link-editor-plugin";
import { FloatingTextFormatToolbarPlugin } from "../plugins/floating-text-format-toolbar-plugin";
import { ImagesPlugin } from "../plugins/images-plugin";
import { KeywordsPlugin } from "../plugins/keywords-plugin";
import { LayoutPlugin } from "../plugins/layout-plugin";
import { LinkPlugin } from "../plugins/link-plugin";
import { ListMaxIndentLevelPlugin } from "../plugins/list-max-indent-level-plugin";
import { MentionsPlugin } from "../plugins/mentions-plugin";
import { PageBreakPlugin } from "../plugins/page-break-plugin";
import { PollPlugin } from "../plugins/poll-plugin";
import { TabFocusPlugin } from "../plugins/tab-focus-plugin";
import { BlockFormatDropDown } from "../plugins/toolbar/block-format-toolbar-plugin";
import { FormatBulletedList } from "../plugins/toolbar/block-format/format-bulleted-list";
import { FormatCheckList } from "../plugins/toolbar/block-format/format-check-list";
import { FormatCodeBlock } from "../plugins/toolbar/block-format/format-code-block";
import { FormatHeading } from "../plugins/toolbar/block-format/format-heading";
import { FormatNumberedList } from "../plugins/toolbar/block-format/format-numbered-list";
import { FormatParagraph } from "../plugins/toolbar/block-format/format-paragraph";
import { FormatQuote } from "../plugins/toolbar/block-format/format-quote";
import { ClearFormattingToolbarPlugin } from "../plugins/toolbar/clear-formatting-toolbar-plugin";
import { CodeLanguageToolbarPlugin } from "../plugins/toolbar/code-language-toolbar-plugin";
import { ElementFormatToolbarPlugin } from "../plugins/toolbar/element-format-toolbar-plugin";
import { FontBackgroundToolbarPlugin } from "../plugins/toolbar/font-background-toolbar-plugin";
import { FontColorToolbarPlugin } from "../plugins/toolbar/font-color-toolbar-plugin";
import { FontFamilyToolbarPlugin } from "../plugins/toolbar/font-family-toolbar-plugin";
import { FontFormatToolbarPlugin } from "../plugins/toolbar/font-format-toolbar-plugin";
import { FontSizeToolbarPlugin } from "../plugins/toolbar/font-size-toolbar-plugin";
import { HistoryToolbarPlugin } from "../plugins/toolbar/history-toolbar-plugin";
import { LinkToolbarPlugin } from "../plugins/toolbar/link-toolbar-plugin";
import { SubSuperToolbarPlugin } from "../plugins/toolbar/subsuper-toolbar-plugin";
import { ToolbarPlugin } from "../plugins/toolbar/toolbar-plugin";
// import { TypingPerfPlugin } from "../plugins/typing-pref-plugin";
import { MARKDOWN_TRANSFORMERS } from "../transformers/markdown-transformers";

const maxLength = 500;

// eslint-disable-next-line no-empty-pattern
export function Plugins({}) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
      <ToolbarPlugin>
        {({ blockType }) => (
          <div
            className={cn(
              "vertical-align-middle sticky top-0 z-10 flex gap-2 overflow-auto border-b p-1",
              // own
              "flex-wrap",
            )}
          >
            <HistoryToolbarPlugin />
            <Separator orientation="vertical" className="h-8" />
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={["h1", "h2", "h3"]} />
              <FormatNumberedList />
              <FormatBulletedList />
              <FormatCheckList />
              <FormatCodeBlock />
              <FormatQuote />
            </BlockFormatDropDown>
            {blockType === "code" ? (
              <CodeLanguageToolbarPlugin />
            ) : (
              <>
                <FontFamilyToolbarPlugin />
                <FontSizeToolbarPlugin />
                <Separator orientation="vertical" className="h-8" />
                <FontFormatToolbarPlugin format="bold" />
                <FontFormatToolbarPlugin format="italic" />
                <FontFormatToolbarPlugin format="underline" />
                <FontFormatToolbarPlugin format="strikethrough" />
                <Separator orientation="vertical" className="h-8" />
                <SubSuperToolbarPlugin />
                <LinkToolbarPlugin />
                <Separator orientation="vertical" className="h-8" />
                <ClearFormattingToolbarPlugin />
                <Separator orientation="vertical" className="h-8" />
                <FontColorToolbarPlugin />
                <FontBackgroundToolbarPlugin />
                <Separator orientation="vertical" className="h-8" />
                <ElementFormatToolbarPlugin />
                <Separator orientation="vertical" className="h-8" />
              </>
            )}
          </div>
        )}
      </ToolbarPlugin>
      <div className="relative">
        <AutoFocusPlugin />
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable
                  className="h-41 overflow-auto px-8 py-4"
                  placeholder={"Start typing ..."}
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <ClickableLinkPlugin />
        <CheckListPlugin />
        <HorizontalRulePlugin />
        <TablePlugin />
        <ListPlugin />
        <TabIndentationPlugin />
        <HashtagPlugin />
        <HistoryPlugin />

        <MentionsPlugin />
        <PageBreakPlugin />
        <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
        <KeywordsPlugin />
        <EmojisPlugin />
        <ImagesPlugin />
        <ExcalidrawPlugin />
        <PollPlugin />
        <LayoutPlugin />
        <EquationsPlugin />
        <CollapsiblePlugin />

        <AutoEmbedPlugin />
        <FigmaPlugin />
        <YouTubePlugin />

        <CodeHighlightPlugin />
        <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />

        <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
        {/* <TypingPerfPlugin /> */}
        <TabFocusPlugin />
        <AutocompletePlugin />
        <AutoLinkPlugin />
        <LinkPlugin />

        <ComponentPickerMenuPlugin />
        <ContextMenuPlugin />
        <DragDropPastePlugin />
        <EmojiPickerPlugin />

        <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
        <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />

        <ListMaxIndentLevelPlugin />
      </div>
      <ActionsPlugin>
        <div
          className={cn(
            "clear-both flex items-center justify-between gap-2 overflow-auto border-t p-1",
            // own
            "flex-wrap",
          )}
        >
          <div className="flex flex-1 justify-start">
            <MaxLengthPlugin maxLength={maxLength} />
            <CharacterLimitPlugin maxLength={maxLength} charset="UTF-16" />
          </div>

          <div className="flex flex-1 justify-end">
            <SpeechToTextPlugin />
            <ShareContentPlugin />
            <ImportExportPlugin />
            <MarkdownTogglePlugin shouldPreserveNewLinesInMarkdown={true} />
            <EditModeTogglePlugin />
            <>
              <ClearEditorActionPlugin />
              <ClearEditorPlugin />
            </>
            <TreeViewPlugin />
          </div>
        </div>
      </ActionsPlugin>
    </div>
  );
}

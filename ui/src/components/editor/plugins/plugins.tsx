/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { useState } from "react";
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
import { MARKDOWN_TRANSFORMERS } from "../transformers/markdown-transformers";

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
    <div className="relative max-h-96 min-h-96 overflow-auto rounded-md border">
      <AutoFocusPlugin />
      <RichTextPlugin
        contentEditable={
          <div className="" ref={onRef}>
            <ContentEditable
              className="px-8 py-2 focus:outline-none"
              placeholder={"Start typing or press '/' for commands"}
              placeholderClassName="text-muted-foreground pointer-events-none absolute top-8 left-12 overflow-hidden leading-7 text-ellipsis select-none whitespace-nowrap"
            />
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
  );
}

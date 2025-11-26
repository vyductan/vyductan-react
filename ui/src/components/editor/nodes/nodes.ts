import type { Klass, LexicalNode, LexicalNodeReplacement } from "lexical";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { OverflowNode } from "@lexical/overflow";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ParagraphNode, TextNode } from "lexical";

import { AutocompleteNode } from "../nodes/autocomplete-node";
import { CollapsibleContainerNode } from "../nodes/collapsible-container-node";
import { CollapsibleContentNode } from "../nodes/collapsible-content-node";
import { CollapsibleTitleNode } from "../nodes/collapsible-title-node";
import { FigmaNode } from "../nodes/embeds/figma-node";
import { InstagramNode } from "../nodes/embeds/instagram-node";
import { TikTokNode } from "../nodes/embeds/tiktok-node";
import { TwitterNode } from "../nodes/embeds/twitter-node";
import { YouTubeNode } from "../nodes/embeds/youtube-node";
import { EmojiNode } from "../nodes/emoji-node";
import { EquationNode } from "../nodes/equation-node";
import { ExcalidrawNode } from "../nodes/excalidraw-node";
import { FileAttachmentNode } from "../nodes/file-attachment-node";
import { ImageNode } from "../nodes/image-node";
import { KeywordNode } from "../nodes/keyword-node";
import { LayoutContainerNode } from "../nodes/layout-container-node";
import { LayoutItemNode } from "../nodes/layout-item-node";
import { MentionNode } from "../nodes/mention-node";
import { PageBreakNode } from "../nodes/page-break-node";
import { PollNode } from "../nodes/poll-node";
import { TOCNode } from "../nodes/toc-node";
import { VideoNode } from "../nodes/video-node";

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> =
  [
    HeadingNode,
    ParagraphNode,
    TextNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    OverflowNode,
    HashtagNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    CodeNode,
    CodeHighlightNode,
    HorizontalRuleNode,
    MentionNode,
    PageBreakNode,
    ImageNode,
    VideoNode,
    FileAttachmentNode,
    EmojiNode,
    KeywordNode,
    ExcalidrawNode,
    PollNode,
    LayoutContainerNode,
    LayoutItemNode,
    EquationNode,
    CollapsibleContainerNode,
    CollapsibleContentNode,
    CollapsibleTitleNode,
    TOCNode,
    AutoLinkNode,
    FigmaNode,
    YouTubeNode,
    TwitterNode,
    InstagramNode,
    TikTokNode,
    AutocompleteNode,
  ];

export type EditorRenderDirection = "ltr" | "rtl" | null;
export type EditorRenderFormat = string | number;

export type EditorRenderTextNode = {
  detail: number;
  format: number;
  mode: string;
  style: string;
  text: string;
  type: "text";
  version: number;
};

export type EditorRenderLineBreakNode = {
  type: "linebreak";
  version: number;
};

export type EditorRenderInlineNode =
  | EditorRenderTextNode
  | EditorRenderLineBreakNode
  | EditorRenderLinkNode
  | EditorRenderCodeHighlightNode;

export type EditorRenderBlockNode =
  | EditorRenderParagraphNode
  | EditorRenderHeadingNode
  | EditorRenderQuoteNode
  | EditorRenderListNode
  | EditorRenderCheckBlockNode
  | EditorRenderCodeNode
  | EditorRenderHorizontalRuleNode
  | EditorRenderTableNode;

export type EditorRenderElementNode = {
  children: EditorRenderNode[];
  direction: EditorRenderDirection;
  format: EditorRenderFormat;
  indent: number;
  type: string;
  version: number;
};

export type EditorRenderParagraphNode = Omit<
  EditorRenderElementNode,
  "children"
> & {
  children: EditorRenderInlineNode[];
  type: "paragraph";
};

export type EditorRenderHeadingNode = Omit<
  EditorRenderElementNode,
  "children"
> & {
  children: EditorRenderInlineNode[];
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  type: "heading";
};

export type EditorRenderQuoteNode = Omit<
  EditorRenderElementNode,
  "children"
> & {
  children: Array<EditorRenderInlineNode | EditorRenderParagraphNode>;
  type: "quote";
};

export type EditorRenderLinkNode = Omit<EditorRenderElementNode, "children"> & {
  children: Array<
    | EditorRenderTextNode
    | EditorRenderLineBreakNode
    | EditorRenderCodeHighlightNode
  >;
  rel: null | string;
  target: null | string;
  title?: null | string;
  type: "link" | "autolink";
  url: string;
};

export type EditorRenderListNode = Omit<EditorRenderElementNode, "children"> & {
  children: EditorRenderListItemNode[];
  listType: "bullet" | "number" | "check";
  start: number;
  tag: "ol" | "ul";
  type: "list";
};

export type EditorRenderListItemNode = Omit<
  EditorRenderElementNode,
  "children"
> & {
  checked?: boolean;
  children: Array<
    EditorRenderParagraphNode | EditorRenderListNode | EditorRenderInlineNode
  >;
  type: "listitem";
  value: number;
};

export type EditorRenderCheckBlockNode = Omit<
  EditorRenderElementNode,
  "children"
> & {
  checked: boolean;
  children: EditorRenderInlineNode[];
  type: "check-block";
};

export type EditorRenderCodeNode = Omit<EditorRenderElementNode, "children"> & {
  children: Array<
    | EditorRenderTextNode
    | EditorRenderLineBreakNode
    | EditorRenderCodeHighlightNode
  >;
  language?: null | string;
  type: "code";
};

export type EditorRenderCodeHighlightNode = {
  detail: number;
  format: number;
  highlightType: null | string;
  mode: string;
  style: string;
  text: string;
  type: "code-highlight";
  version: number;
};

export type EditorRenderHorizontalRuleNode = {
  type: "horizontalrule";
  version: number;
};

export type EditorRenderTableNode = Omit<
  EditorRenderElementNode,
  "children"
> & {
  children: EditorRenderTableRowNode[];
  type: "table";
};

export type EditorRenderTableRowNode = Omit<
  EditorRenderElementNode,
  "children"
> & {
  children: EditorRenderTableCellNode[];
  type: "tablerow";
};

export type EditorRenderTableCellNode = Omit<
  EditorRenderElementNode,
  "children"
> & {
  backgroundColor: null | string;
  children: EditorRenderParagraphNode[];
  colSpan: number;
  headerState: number;
  rowSpan: number;
  type: "tablecell";
};

export type EditorRenderNode =
  | EditorRenderInlineNode
  | EditorRenderBlockNode
  | EditorRenderListItemNode
  | EditorRenderTableRowNode
  | EditorRenderTableCellNode;

export type EditorRenderRootNode = {
  children: EditorRenderBlockNode[];
  direction: EditorRenderDirection;
  format: EditorRenderFormat;
  indent: number;
  type: "root";
  version: number;
};

export type EditorRenderContent = {
  root: EditorRenderRootNode;
};

export type RawEditorRenderContent = unknown;

export type CanonicalEditorRenderFixtureName =
  | "paragraph"
  | "heading"
  | "quote"
  | "link"
  | "autolink"
  | "bulletList"
  | "numberList"
  | "checkList"
  | "checkBlock"
  | "codeBlock"
  | "horizontalRule"
  | "table"
  | "formattedText"
  | "inlineCode"
  | "softBreak";

export type UnsupportedEditorRenderFixtureName =
  | "image"
  | "video"
  | "fileAttachment"
  | "equation"
  | "poll"
  | "toc"
  | "layout"
  | "collapsible"
  | "embed"
  | "mention"
  | "hashtag"
  | "keyword"
  | "autocomplete"
  | "pageBreak";

export type InvalidEditorRenderFixtureName = "invalidJson" | "invalidShape";

export type EditorRenderFixtureName =
  | CanonicalEditorRenderFixtureName
  | UnsupportedEditorRenderFixtureName
  | InvalidEditorRenderFixtureName;

export type EditorRenderFixture<TContent = RawEditorRenderContent> = {
  content: TContent;
  serialized: string;
};

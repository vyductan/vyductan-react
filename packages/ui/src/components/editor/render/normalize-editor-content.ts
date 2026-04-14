/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import type {
  EditorRenderBlockNode,
  EditorRenderContent,
  EditorRenderInlineNode,
  EditorRenderNode,
} from "./render-types";

const supportedNodeTypes = new Set([
  "root",
  "paragraph",
  "heading",
  "quote",
  "text",
  "linebreak",
  "link",
  "autolink",
  "list",
  "listitem",
  "check-block",
  "code",
  "code-highlight",
  "horizontalrule",
  "table",
  "tablerow",
  "tablecell",
]);

const supportedListTypes = new Set(["bullet", "number", "check"]);
const supportedHeadingTags = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const supportedListTags = new Set(["ol", "ul"]);

export function normalizeEditorContent(
  value: unknown,
): EditorRenderContent | null {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return isEditorRenderContent(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return isEditorRenderContent(value) ? value : null;
}

function isEditorRenderContent(value: unknown): value is EditorRenderContent {
  if (!isRecord(value)) {
    return false;
  }

  return isRootNode(value.root);
}

function isRootNode(node: unknown): node is EditorRenderContent["root"] {
  return (
    isElementNodeBase(node) &&
    node.type === "root" &&
    Array.isArray(node.children) &&
    node.children.every((child) => isBlockNode(child))
  );
}

function isNode(node: unknown, allowInline = true): node is EditorRenderNode {
  if (!isRecord(node) || typeof node.type !== "string") {
    return false;
  }

  if (!supportedNodeTypes.has(node.type)) {
    return false;
  }

  switch (node.type) {
    case "text": {
      return isTextNode(node);
    }
    case "linebreak": {
      return isLineBreakNode(node);
    }
    case "horizontalrule": {
      return isHorizontalRuleNode(node);
    }
    case "heading": {
      return !allowInline && isHeadingNode(node);
    }
    case "paragraph": {
      return !allowInline && isParagraphNode(node);
    }
    case "quote": {
      return !allowInline && isQuoteNode(node);
    }
    case "list": {
      return !allowInline && isListNode(node);
    }
    case "check-block": {
      return !allowInline && isCheckBlockNode(node);
    }
    case "code": {
      return !allowInline && isCodeNode(node);
    }
    case "table": {
      return !allowInline && isTableNode(node);
    }
    case "tablerow": {
      return allowInline && isTableRowNode(node);
    }
    case "tablecell": {
      return allowInline && isTableCellNode(node);
    }
    case "listitem": {
      return allowInline && isListItemNode(node);
    }
    case "link":
    case "autolink": {
      return allowInline && isLinkNode(node);
    }
    case "code-highlight": {
      return allowInline && isCodeHighlightNode(node);
    }
    default: {
      return false;
    }
  }
}

function isElementNodeBase(node: unknown): node is {
  children: unknown[];
  direction: null | string;
  format: number | string;
  indent: number;
  type: string;
  version: number;
} {
  return (
    isRecord(node) &&
    Array.isArray(node.children) &&
    (node.direction === null ||
      node.direction === "ltr" ||
      node.direction === "rtl") &&
    (typeof node.format === "string" || typeof node.format === "number") &&
    typeof node.indent === "number" &&
    typeof node.type === "string" &&
    typeof node.version === "number"
  );
}

function isParagraphNode(node: unknown): boolean {
  return (
    isElementNodeBase(node) &&
    node.type === "paragraph" &&
    node.children.every((child) => isInlineNode(child))
  );
}

function isHeadingNode(node: unknown): boolean {
  return (
    isElementNodeBase(node) &&
    node.type === "heading" &&
    "tag" in node &&
    typeof node.tag === "string" &&
    supportedHeadingTags.has(node.tag) &&
    node.children.every((child) => isInlineNode(child))
  );
}

function isQuoteNode(node: unknown): boolean {
  return (
    isElementNodeBase(node) &&
    node.type === "quote" &&
    node.children.every(
      (child) =>
        (isNode(child, true) && isRecord(child) && isInlineNode(child)) ||
        (isNode(child, false) && isRecord(child) && child.type === "paragraph"),
    )
  );
}

function isLinkNode(node: unknown): boolean {
  return (
    isElementNodeBase(node) &&
    (node.type === "link" || node.type === "autolink") &&
    "url" in node &&
    typeof node.url === "string" &&
    "rel" in node &&
    (node.rel === null || typeof node.rel === "string") &&
    "target" in node &&
    (node.target === null || typeof node.target === "string") &&
    (!("title" in node) ||
      node.title === undefined ||
      node.title === null ||
      typeof node.title === "string") &&
    node.children.every((child) => isInlineNode(child))
  );
}

function isListNode(node: unknown): boolean {
  return (
    isElementNodeBase(node) &&
    node.type === "list" &&
    "listType" in node &&
    typeof node.listType === "string" &&
    supportedListTypes.has(node.listType) &&
    "start" in node &&
    typeof node.start === "number" &&
    "tag" in node &&
    typeof node.tag === "string" &&
    supportedListTags.has(node.tag) &&
    node.children.every(
      (child) =>
        isNode(child, true) && isRecord(child) && child.type === "listitem",
    )
  );
}

function isListItemNode(node: unknown): boolean {
  return (
    isElementNodeBase(node) &&
    node.type === "listitem" &&
    "value" in node &&
    typeof node.value === "number" &&
    (!("checked" in node) ||
      node.checked === undefined ||
      typeof node.checked === "boolean") &&
    node.children.every(
      (child) =>
        (isNode(child, false) &&
          isRecord(child) &&
          (child.type === "paragraph" || child.type === "list")) ||
        (isNode(child, true) && isRecord(child) && isInlineNode(child)),
    )
  );
}

function isCheckBlockNode(node: unknown): boolean {
  return (
    isElementNodeBase(node) &&
    node.type === "check-block" &&
    "checked" in node &&
    typeof node.checked === "boolean" &&
    node.children.every((child) => isInlineNode(child))
  );
}

function isCodeNode(node: unknown): boolean {
  return (
    isElementNodeBase(node) &&
    node.type === "code" &&
    (!("language" in node) ||
      node.language === undefined ||
      node.language === null ||
      typeof node.language === "string") &&
    node.children.every(
      (child) =>
        isNode(child, true) &&
        isRecord(child) &&
        (child.type === "text" ||
          child.type === "linebreak" ||
          child.type === "code-highlight"),
    )
  );
}

function isCodeHighlightNode(node: unknown): boolean {
  return (
    isRecord(node) &&
    node.type === "code-highlight" &&
    typeof node.text === "string" &&
    typeof node.detail === "number" &&
    typeof node.format === "number" &&
    typeof node.mode === "string" &&
    typeof node.style === "string" &&
    typeof node.version === "number" &&
    (node.highlightType === null || typeof node.highlightType === "string")
  );
}

function isHorizontalRuleNode(node: unknown): boolean {
  return (
    isRecord(node) &&
    node.type === "horizontalrule" &&
    typeof node.version === "number"
  );
}

function isTableNode(node: unknown): boolean {
  return (
    isElementNodeBase(node) &&
    node.type === "table" &&
    node.children.every(
      (child) =>
        isNode(child, true) && isRecord(child) && child.type === "tablerow",
    )
  );
}

function isTableRowNode(node: unknown): boolean {
  return (
    isElementNodeBase(node) &&
    node.type === "tablerow" &&
    node.children.every(
      (child) =>
        isNode(child, true) && isRecord(child) && child.type === "tablecell",
    )
  );
}

function isTableCellNode(node: unknown): boolean {
  return (
    isElementNodeBase(node) &&
    node.type === "tablecell" &&
    "colSpan" in node &&
    typeof node.colSpan === "number" &&
    "rowSpan" in node &&
    typeof node.rowSpan === "number" &&
    "headerState" in node &&
    typeof node.headerState === "number" &&
    "backgroundColor" in node &&
    (node.backgroundColor === null ||
      typeof node.backgroundColor === "string") &&
    node.children.every(
      (child) =>
        isNode(child, false) && isRecord(child) && child.type === "paragraph",
    )
  );
}

function isTextNode(node: unknown): boolean {
  return (
    isRecord(node) &&
    node.type === "text" &&
    typeof node.text === "string" &&
    typeof node.detail === "number" &&
    typeof node.format === "number" &&
    typeof node.mode === "string" &&
    typeof node.style === "string" &&
    typeof node.version === "number"
  );
}

function isLineBreakNode(node: unknown): boolean {
  return (
    isRecord(node) &&
    node.type === "linebreak" &&
    typeof node.version === "number"
  );
}

function isBlockNode(node: unknown): node is EditorRenderBlockNode {
  return (
    isNode(node, false) &&
    isRecord(node) &&
    (node.type === "paragraph" ||
      node.type === "heading" ||
      node.type === "quote" ||
      node.type === "list" ||
      node.type === "check-block" ||
      node.type === "code" ||
      node.type === "horizontalrule" ||
      node.type === "table")
  );
}

function isInlineNode(node: unknown): node is EditorRenderInlineNode {
  return (
    isNode(node, true) &&
    isRecord(node) &&
    (node.type === "text" ||
      node.type === "linebreak" ||
      node.type === "link" ||
      node.type === "autolink" ||
      node.type === "code-highlight")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

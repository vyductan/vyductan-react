/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import type { ReactNode } from "react";
import { Fragment } from "react";

import { cn } from "@acme/ui/lib/utils";

import type {
  EditorRenderCheckBlockNode,
  EditorRenderCodeHighlightNode,
  EditorRenderContent,
  EditorRenderInlineNode,
  EditorRenderLinkNode,
  EditorRenderListItemNode,
  EditorRenderListNode,
  EditorRenderNode,
  EditorRenderTableCellNode,
  EditorRenderTextNode,
} from "./render-types";
import { richTextSemanticContract } from "../themes/rich-text-semantic-contract";
import { sanitizeUrl } from "../utils/url";

const TEXT_FORMAT_BOLD = 1;
const TEXT_FORMAT_ITALIC = 1 << 1;
const TEXT_FORMAT_STRIKETHROUGH = 1 << 2;
const TEXT_FORMAT_UNDERLINE = 1 << 3;
const TEXT_FORMAT_CODE = 1 << 4;
const TEXT_FORMAT_SUBSCRIPT = 1 << 5;
const TEXT_FORMAT_SUPERSCRIPT = 1 << 6;

export function renderRootNodes(
  nodes: EditorRenderContent["root"]["children"],
): ReactNode[] {
  return nodes.map((node, index) => renderNode(node, String(index), 0));
}

export function renderNode(
  node: EditorRenderNode,
  key: string,
  depth = 0,
): ReactNode {
  switch (node.type) {
    case "paragraph": {
      return (
        <p key={key} className={richTextSemanticContract.paragraph}>
          {renderInlineChildren(node.children, `${key}-child`)}
        </p>
      );
    }
    case "heading": {
      const Tag = node.tag;
      return (
        <Tag key={key} className={richTextSemanticContract.heading[node.tag]}>
          {renderInlineChildren(node.children, `${key}-child`)}
        </Tag>
      );
    }
    case "quote": {
      return (
        <blockquote key={key} className={richTextSemanticContract.quote}>
          {node.children.map((child, index) =>
            renderNode(child, `${key}-child-${index}`, depth),
          )}
        </blockquote>
      );
    }
    case "link":
    case "autolink": {
      return renderLinkNode(node, key);
    }
    case "list": {
      return renderListNode(node, key, depth);
    }
    case "listitem": {
      return renderListItemNode(node, key, depth);
    }
    case "check-block": {
      return renderCheckBlockNode(node, key);
    }
    case "code": {
      return (
        <pre key={key}>
          <code className={richTextSemanticContract.code}>
            {node.children.map((child, index) =>
              renderCodeChild(child, `${key}-${index}`),
            )}
          </code>
        </pre>
      );
    }
    case "horizontalrule": {
      return <hr key={key} className={richTextSemanticContract.hr} />;
    }
    case "table": {
      return (
        <table key={key} className={richTextSemanticContract.table}>
          <tbody>
            {node.children.map((child, index) =>
              renderNode(child, `${key}-${index}`, depth),
            )}
          </tbody>
        </table>
      );
    }
    case "tablerow": {
      return (
        <tr key={key}>
          {node.children.map((child, index) =>
            renderNode(child, `${key}-${index}`, depth),
          )}
        </tr>
      );
    }
    case "tablecell": {
      return renderTableCellNode(node, key);
    }
    case "text": {
      return renderTextNode(node, key);
    }
    case "linebreak": {
      return <br key={key} />;
    }
    case "code-highlight": {
      return renderCodeHighlightNode(node, key);
    }
    default: {
      return null;
    }
  }
}

function renderInlineChildren(
  children: EditorRenderInlineNode[],
  keyPrefix: string,
): ReactNode[] {
  return children.map((child, index) =>
    renderNode(child, `${keyPrefix}-${index}`),
  );
}

function renderLinkNode(node: EditorRenderLinkNode, key: string): ReactNode {
  const sanitizedUrl = sanitizeUrl(node.url);

  if (sanitizedUrl === "about:blank") {
    return (
      <Fragment key={key}>
        {renderInlineChildren(node.children, `${key}-child`)}
      </Fragment>
    );
  }

  return (
    <a
      key={key}
      className={richTextSemanticContract.link}
      href={sanitizedUrl}
      rel={node.rel ?? undefined}
      target={node.target ?? undefined}
      title={node.title ?? undefined}
    >
      {renderInlineChildren(node.children, `${key}-child`)}
    </a>
  );
}

function renderListNode(
  node: EditorRenderListNode,
  key: string,
  depth: number,
): ReactNode {
  const Tag = node.tag;
  const listClassName =
    node.tag === "ol"
      ? cn(
          richTextSemanticContract.list.ol,
          richTextSemanticContract.list.olDepth[
            depth % richTextSemanticContract.list.olDepth.length
          ],
        )
      : cn(
          richTextSemanticContract.list.ul,
          richTextSemanticContract.list.ulDepth[
            depth % richTextSemanticContract.list.ulDepth.length
          ],
          node.listType === "check" && richTextSemanticContract.list.checklist,
        );
  const items = coalesceNestedListItems(node.children);

  return (
    <Tag
      key={key}
      className={listClassName}
      start={node.tag === "ol" ? node.start : undefined}
    >
      {items.map((child, index) =>
        renderListItemNode(child, `${key}-${index}`, depth),
      )}
    </Tag>
  );
}

function renderListItemNode(
  node: EditorRenderListItemNode,
  key: string,
  depth: number,
): ReactNode {
  const isChecklistItem = typeof node.checked === "boolean";
  const checkboxLabel = isChecklistItem ? getListItemLabel(node) : undefined;
  const className = cn(
    richTextSemanticContract.list.listitem,
    depth > 0 && richTextSemanticContract.list.nested.listitem,
    isChecklistItem &&
      (node.checked
        ? richTextSemanticContract.list.listitemChecked
        : richTextSemanticContract.list.listitemUnchecked),
  );

  return (
    <li key={key} className={className} value={node.value}>
      {isChecklistItem ? (
        <input
          aria-label={checkboxLabel || undefined}
          checked={node.checked}
          className="sr-only"
          readOnly
          type="checkbox"
        />
      ) : null}
      {renderListItemChildren(node.children, key, depth)}
    </li>
  );
}

function renderCheckBlockNode(
  node: EditorRenderCheckBlockNode,
  key: string,
): ReactNode {
  const checkboxLabel = getInlineText(node.children);

  return (
    <div
      key={key}
      className={cn(
        richTextSemanticContract.checkBlock,
        node.checked && richTextSemanticContract.checkBlockChecked,
      )}
    >
      <input
        aria-label={checkboxLabel || undefined}
        checked={node.checked}
        className="sr-only"
        readOnly
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className={richTextSemanticContract.checkBlockIcon}
        data-check-icon
      />
      <span data-lexical-text="true">
        {renderInlineChildren(node.children, `${key}-child`)}
      </span>
    </div>
  );
}

function renderListItemChildren(
  children: EditorRenderListItemNode["children"],
  key: string,
  depth: number,
): ReactNode[] {
  const renderedChildren: ReactNode[] = [];
  let inlineBuffer: EditorRenderInlineNode[] = [];

  const flushInlineBuffer = () => {
    if (inlineBuffer.length === 0) {
      return;
    }

    renderedChildren.push(
      <p
        key={`${key}-paragraph-${renderedChildren.length}`}
        className={richTextSemanticContract.paragraph}
      >
        {renderInlineChildren(
          inlineBuffer,
          `${key}-inline-${renderedChildren.length}`,
        )}
      </p>,
    );
    inlineBuffer = [];
  };

  for (const child of children) {
    if (child.type === "list") {
      flushInlineBuffer();
      renderedChildren.push(
        renderListNode(
          child,
          `${key}-list-${renderedChildren.length}`,
          depth + 1,
        ),
      );
      continue;
    }

    if (child.type === "paragraph") {
      flushInlineBuffer();
      renderedChildren.push(
        renderNode(child, `${key}-paragraph-${renderedChildren.length}`, depth),
      );
      continue;
    }

    inlineBuffer.push(child);
  }

  flushInlineBuffer();
  return renderedChildren;
}

function coalesceNestedListItems(
  items: EditorRenderListItemNode[],
): EditorRenderListItemNode[] {
  const coalescedItems: EditorRenderListItemNode[] = [];

  for (const item of items) {
    if (
      item.children.length === 1 &&
      item.children[0]?.type === "list" &&
      coalescedItems.length > 0
    ) {
      const previousItem = coalescedItems.at(-1);

      if (!previousItem) {
        continue;
      }

      coalescedItems[coalescedItems.length - 1] = {
        ...previousItem,
        children: [...previousItem.children, item.children[0]],
      };
      continue;
    }

    coalescedItems.push(item);
  }

  return coalescedItems;
}

function renderTableCellNode(
  node: EditorRenderTableCellNode,
  key: string,
): ReactNode {
  const Tag = node.headerState > 0 ? "th" : "td";
  const className =
    node.headerState > 0
      ? richTextSemanticContract.tableCellHeader
      : richTextSemanticContract.tableCell;

  return (
    <Tag
      key={key}
      className={className}
      colSpan={node.colSpan}
      rowSpan={node.rowSpan}
      style={
        node.backgroundColor
          ? { backgroundColor: node.backgroundColor }
          : undefined
      }
    >
      {node.children.map((child, index) =>
        renderNode(child, `${key}-${index}`),
      )}
    </Tag>
  );
}

function renderCodeChild(
  child:
    | EditorRenderCodeHighlightNode
    | EditorRenderTextNode
    | { type: "linebreak"; version: number },
  key: string,
): ReactNode {
  if (child.type === "linebreak") {
    return <br key={key} />;
  }

  if (child.type === "code-highlight") {
    return renderCodeHighlightNode(child, key);
  }

  return <span key={key}>{child.text}</span>;
}

function renderCodeHighlightNode(
  node: EditorRenderCodeHighlightNode,
  key: string,
): ReactNode {
  const className = node.highlightType
    ? richTextSemanticContract.codeHighlight[
        node.highlightType as keyof typeof richTextSemanticContract.codeHighlight
      ]
    : undefined;

  return (
    <span key={key} className={className}>
      {node.text}
    </span>
  );
}

function renderTextNode(node: EditorRenderTextNode, key: string): ReactNode {
  let content: ReactNode = node.text;
  let hasMarkup = false;

  if (hasFormat(node.format, TEXT_FORMAT_CODE)) {
    hasMarkup = true;
    content = (
      <code className={richTextSemanticContract.text.code} key={`${key}-code`}>
        {content}
      </code>
    );
  }

  if (
    hasFormat(node.format, TEXT_FORMAT_UNDERLINE) &&
    hasFormat(node.format, TEXT_FORMAT_STRIKETHROUGH)
  ) {
    hasMarkup = true;
    content = (
      <span
        className={richTextSemanticContract.text.underlineStrikethrough}
        key={`${key}-us`}
      >
        {content}
      </span>
    );
  } else {
    if (hasFormat(node.format, TEXT_FORMAT_UNDERLINE)) {
      hasMarkup = true;
      content = <u key={`${key}-underline`}>{content}</u>;
    }

    if (hasFormat(node.format, TEXT_FORMAT_STRIKETHROUGH)) {
      hasMarkup = true;
      content = <s key={`${key}-strike`}>{content}</s>;
    }
  }

  if (hasFormat(node.format, TEXT_FORMAT_ITALIC)) {
    hasMarkup = true;
    content = <em key={`${key}-italic`}>{content}</em>;
  }

  if (hasFormat(node.format, TEXT_FORMAT_BOLD)) {
    hasMarkup = true;
    content = <strong key={`${key}-bold`}>{content}</strong>;
  }

  if (hasFormat(node.format, TEXT_FORMAT_SUBSCRIPT)) {
    hasMarkup = true;
    content = <sub key={`${key}-sub`}>{content}</sub>;
  }

  if (hasFormat(node.format, TEXT_FORMAT_SUPERSCRIPT)) {
    hasMarkup = true;
    content = <sup key={`${key}-sup`}>{content}</sup>;
  }

  if (!hasMarkup) {
    return node.text;
  }

  return content;
}

function hasFormat(format: number, flag: number): boolean {
  return (format & flag) === flag;
}

function getListItemLabel(node: EditorRenderListItemNode): string {
  return node.children
    .map((child) => {
      if (child.type === "paragraph") {
        return getInlineText(child.children);
      }

      if (child.type === "list") {
        return "";
      }

      return getInlineText([child]);
    })
    .join(" ")
    .trim();
}

function getInlineText(children: EditorRenderInlineNode[]): string {
  return children
    .map((child) => {
      switch (child.type) {
        case "text":
        case "code-highlight": {
          return child.text;
        }
        case "linebreak": {
          return " ";
        }
        case "link":
        case "autolink": {
          return getInlineText(child.children);
        }
        default: {
          return "";
        }
      }
    })
    .join("")
    .trim();
}

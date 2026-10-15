import type { ListNode } from "@lexical/list";
import type {
  ElementTransformer,
  MultilineElementTransformer,
  TextMatchTransformer,
  Transformer,
} from "@lexical/markdown";
import type { LexicalEditor, LexicalNode, NodeKey } from "lexical";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { ORDERED_LIST, UNORDERED_LIST } from "@lexical/markdown";
import { $getEditor, $isElementNode, $isParagraphNode } from "lexical";

import {
  $createNfmRawBlockNode,
  $createNfmRawInlineNode,
  $isNfmRawBlockNode,
  $isNfmRawInlineNode,
  NfmRawBlockNode,
  NfmRawInlineNode,
} from "../nodes/nfm-raw-node";
import { findClosingLine } from "./markdown-nfm-blocks-transformer";

/*
 * Notion-flavored Markdown the editor does not model, kept byte for byte as
 * NfmRaw chips (see nodes/nfm-raw-node.tsx).
 * https://developers.notion.com/guides/data-apis/enhanced-markdown
 *
 * Blocks: a line starting with one of these tags, through its closing tag
 * (nested same tags counted) — or just that line when it closes itself.
 * Inline: mentions and <span color/underline> within a line.
 */

const RAW_BLOCK_TAGS = [
  "page",
  "database",
  "unknown",
  "empty-block",
  "table_of_contents",
  "table",
  "columns",
  "synced_block",
  "synced_block_reference",
  "audio",
  "video",
  "file",
  "pdf",
];

const RAW_BLOCK_START = new RegExp(
  String.raw`^<(${RAW_BLOCK_TAGS.join("|")})(?=[\s/>])[^>]*>`,
);

export const NFM_RAW_BLOCK: MultilineElementTransformer = {
  dependencies: [NfmRawBlockNode],
  export: (node) => ($isNfmRawBlockNode(node) ? node.getMarkup() : null),
  handleImportAfterStartMatch: ({
    lines,
    rootNode,
    startLineIndex,
    startMatch,
  }) => {
    const tag = startMatch[1]!;
    const first = lines[startLineIndex]!;
    const closesOnItsLine =
      startMatch[0].endsWith("/>") || first.includes(`</${tag}>`);
    const end = closesOnItsLine
      ? startLineIndex
      : findClosingLine(lines, startLineIndex, tag);
    if (end === -1) return null;

    rootNode.append(
      $createNfmRawBlockNode(lines.slice(startLineIndex, end + 1).join("\n")),
    );
    return [true, end];
  },
  regExpStart: RAW_BLOCK_START,
  // Import only; there is nothing to type.
  replace: () => false,
  type: "multiline-element",
};

// <mention-x …>…</mention-x>, <mention-x …/>, <span …>…</span>.
const RAW_INLINE =
  /<(mention-[\w-]+|span)\b[^>]*>.*?<\/\1>|<mention-[\w-]+\b[^>]*\/>/;

export const NFM_RAW_INLINE: TextMatchTransformer = {
  dependencies: [NfmRawInlineNode],
  export: (node) => ($isNfmRawInlineNode(node) ? node.getMarkup() : null),
  importRegExp: RAW_INLINE,
  regExp: new RegExp(`(?:${RAW_INLINE.source})$`),
  replace: (textNode, match) => {
    textNode.replace($createNfmRawInlineNode(match[0]));
  },
  type: "text-match",
};

/**
 * Notion indents child blocks — nested list items too — with tabs; Lexical
 * writes four spaces. Both read back the same; tabs are what Notion's own
 * markdown has, so a pulled page is not rewritten line by line on push.
 *
 * Read back, an item is nested by how far it is indented relative to its
 * parent's text, as CommonMark has it. Lexical counted four spaces (or a
 * tab) a level, so three spaces under `1. ` — what Prettier writes on save —
 * and GitHub's two under `- ` read as no nesting at all: saving a file in
 * VD Markdown flattened its lists.
 */
function withTabIndent(transformer: ElementTransformer): ElementTransformer {
  return {
    ...transformer,
    export: (node, traverseChildren) =>
      transformer
        .export(node, traverseChildren)
        ?.replaceAll(/^(?: {4})+/gm, (spaces) =>
          "\t".repeat(spaces.length / 4),
        ) ?? null,
    replace: (parentNode, children, match, isImport) => {
      if (!isImport) {
        // Typed ("- ") on an indented line — under a to-do, say — the item
        // is nested that deep, as in Notion.
        const indented = [...match];
        indented[1] = "\t".repeat(parentNode.getIndent()) + (match[1] ?? "");
        return transformer.replace(parentNode, children, indented, isImport);
      }
      const indent = columnsOf(match[1] ?? "");
      const parents = $listContentColumns(parentNode);
      // Nested under each item above whose text it reaches; under a to-do,
      // by the to-do's text; else Lexical's own count stands.
      let depth: number | undefined;
      const todo = parents ? null : $todoAbove(parentNode);
      if (todo) {
        depth = $importedTodoIndent(todo, match[1] ?? "");
      } else if (parents) {
        depth = 0;
        for (const column of parents) {
          if (indent < column) break;
          depth++;
        }
      }
      const leveled = [...match];
      if (depth !== undefined) leveled[1] = "\t".repeat(depth);
      const result = transformer.replace(
        parentNode,
        children,
        leveled,
        isImport,
      );
      const item = children[0]?.getParent();
      if ($isListItemNode(item)) {
        contentColumns().set(item.getKey(), columnsOf(match[0] ?? ""));
      }
      return result;
    },
  };
}

/** The to-do just above `node`, blank lines between not counting. */
function $todoAbove(node: LexicalNode): LexicalNode | null {
  let above = node.getPreviousSibling();
  while ($isParagraphNode(above) && above.getTextContentSize() === 0) {
    above = above.getPreviousSibling();
  }
  return above?.getType() === "check-block" ? above : null;
}

/** Columns a run of whitespace (and marker) spans: a tab to the next stop of 4. */
const columnsOf = (text: string) => {
  let column = 0;
  for (const char of text)
    column = char === "\t" ? column - (column % 4) + 4 : column + 1;
  return column;
};

// Where each imported list item's text starts, by node key, per editor.
const COLUMNS = new WeakMap<LexicalEditor, Map<NodeKey, number>>();
const contentColumns = () => {
  const editor = $getEditor();
  let columns = COLUMNS.get(editor);
  if (!columns) COLUMNS.set(editor, (columns = new Map()));
  return columns;
};

/**
 * The text columns of the items a line below `node` could nest under: the
 * last item of the list just above, then of its nested list, and so on —
 * null when no list is just above (blank lines between do not count).
 */
function $listContentColumns(node: LexicalNode): number[] | null {
  let above = node.getPreviousSibling();
  while ($isParagraphNode(above) && above.getTextContentSize() === 0) {
    above = above.getPreviousSibling();
  }
  if (!$isListNode(above)) return null;
  const columns = contentColumns();
  const result: number[] = [];
  let list: ListNode | null = above;
  while (list) {
    const last: LexicalNode | null = list.getLastChild();
    if (!$isListItemNode(last)) break;
    const nested: LexicalNode | null = last.getFirstChild();
    const wrapper: boolean =
      last.getChildrenSize() === 1 && $isListNode(nested);
    const item = wrapper ? last.getPreviousSibling() : last;
    const column = $isListItemNode(item)
      ? columns.get(item.getKey())
      : undefined;
    // Not read from markdown here: two past the level before it.
    result.push(column ?? (result.at(-1) ?? 0) + 2);
    list = wrapper ? (nested as ListNode) : null;
  }
  return result;
}

/** ELEMENT_TRANSFORMERS with the lists writing tab indents. */
export const withTabIndentedLists = (transformer: Transformer): Transformer =>
  transformer === UNORDERED_LIST || transformer === ORDERED_LIST
    ? withTabIndent(transformer)
    : transformer;

// Where each imported to-do starts and where its text starts, by node key,
// per editor.
const TODO_COLUMNS = new WeakMap<
  LexicalEditor,
  Map<NodeKey, { lead: number; text: number }>
>();
const todoColumns = () => {
  const editor = $getEditor();
  let columns = TODO_COLUMNS.get(editor);
  if (!columns) TODO_COLUMNS.set(editor, (columns = new Map()));
  return columns;
};

/**
 * The indent a to-do read from markdown takes, as a nested list item's:
 * under the to-do above whose text it reaches, beside one it lines up with.
 * `leading` is its line's indent. With no to-do just above, a tab (or four
 * spaces) is a level.
 */
export function $importedTodoIndent(
  before: LexicalNode | null,
  leading: string,
): number {
  const column = columnsOf(leading);
  const columns = todoColumns();
  let above = before;
  while (above) {
    if ($isParagraphNode(above) && above.getTextContentSize() === 0) {
      above = above.getPreviousSibling();
      continue;
    }
    if (!$isElementNode(above) || above.getType() !== "check-block") break;
    const at = columns.get(above.getKey()) ?? {
      lead: above.getIndent() * 4,
      text: above.getIndent() * 4 + 2,
    };
    if (column >= at.text) return above.getIndent() + 1;
    if (column >= at.lead) return above.getIndent();
    above = above.getPreviousSibling();
  }
  return Math.floor(column / 4);
}

/** Remembers where an imported to-do's line and text start. */
export function $rememberImportedTodo(node: LexicalNode, leading: string) {
  todoColumns().set(node.getKey(), {
    lead: columnsOf(leading),
    // Its text is after `- `: the `[ ]` is the text's, as CommonMark has it.
    text: columnsOf(leading) + 2,
  });
}

import type {
  ElementTransformer,
  MultilineElementTransformer,
  TextMatchTransformer,
  Transformer,
} from "@lexical/markdown";
import { ORDERED_LIST, UNORDERED_LIST } from "@lexical/markdown";

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
  };
}

/** ELEMENT_TRANSFORMERS with the lists writing tab indents. */
export const withTabIndentedLists = (transformer: Transformer): Transformer =>
  transformer === UNORDERED_LIST || transformer === ORDERED_LIST
    ? withTabIndent(transformer)
    : transformer;

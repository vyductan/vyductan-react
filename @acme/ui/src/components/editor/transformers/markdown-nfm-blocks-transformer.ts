import type { MultilineElementTransformer } from "@lexical/markdown";
import type { ElementNode } from "lexical";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";

import {
  $createCalloutNode,
  $isCalloutNode,
  CalloutNode,
} from "../nodes/callout-node";
import {
  $createCollapsibleContainerNode,
  $isCollapsibleContainerNode,
  CollapsibleContainerNode,
} from "../nodes/collapsible-container-node";
import {
  $createCollapsibleContentNode,
  $isCollapsibleContentNode,
  CollapsibleContentNode,
} from "../nodes/collapsible-content-node";
import {
  $createCollapsibleTitleNode,
  $isCollapsibleTitleNode,
  CollapsibleTitleNode,
} from "../nodes/collapsible-title-node";
import { MARKDOWN_DOCUMENT_TRANSFORMERS } from "./markdown-transformers";

/*
 * Toggles and callouts in Notion-flavored Markdown, the format Notion's
 * markdown API reads and writes:
 * https://developers.notion.com/guides/data-apis/enhanced-markdown
 *
 *   <details><summary>Title</summary>      <callout icon="💡" color="blue_bg">
 *   	child blocks, one tab deeper           	child blocks, one tab deeper
 *   </details>                             </callout>
 *
 * GitHub renders <details> as a real toggle; it hides an unknown <callout>
 * tag and shows the text inside. Reading also accepts GitHub's habit of the
 * summary on its own line and unindented children.
 *
 * Whole-document conversion only (MARKDOWN_DOCUMENT_TRANSFORMERS): neither has
 * a typing shortcut.
 */

const DETAILS_START = /^<details(\s[^>]*)?>/;
const CALLOUT_START = /^<callout(\s[^>]*)?>/;
const SUMMARY = /^\s*<summary>(.*)<\/summary>\s*$/;
const ATTRIBUTE = /([\w-]+)(?:="([^"]*)")?/g;

const attributesOf = (source = "") =>
  Object.fromEntries(
    [...source.matchAll(ATTRIBUTE)].map(([, name, value]) => [
      name,
      value ?? "",
    ]),
  );

const escapeAttribute = (value: string) => value.replaceAll('"', "&quot;");
const unescapeAttribute = (value: string) => value.replaceAll("&quot;", '"');

/** The line closing the tag opened at `start`, counting nested same tags. */
function findClosingLine(lines: string[], start: number, tag: string) {
  const opens = new RegExp(String.raw`^\s*<${tag}(\s|>)`);
  const closes = new RegExp(String.raw`^\s*</${tag}>\s*$`);
  let depth = 1;
  for (let index = start + 1; index < lines.length; index++) {
    const line = lines[index]!;
    if (opens.test(line)) depth++;
    else if (closes.test(line) && --depth === 0) return index;
  }
  return -1;
}

/** Children sit one tab deeper; GitHub-style markdown has them unindented. */
const dedent = (lines: string[]) =>
  lines
    .map((line) => (line.startsWith("\t") ? line.slice(1) : line))
    .join("\n");

const indent = (markdown: string) =>
  markdown
    .split("\n")
    .map((line) => (line === "" ? line : `\t${line}`))
    .join("\n");

const $importBlocks = (markdown: string, into: ElementNode) =>
  $convertFromMarkdownString(markdown, MARKDOWN_DOCUMENT_TRANSFORMERS, into);

const $exportBlocks = (node: ElementNode) =>
  $convertToMarkdownString(MARKDOWN_DOCUMENT_TRANSFORMERS, node);

export const DETAILS: MultilineElementTransformer = {
  dependencies: [
    CollapsibleContainerNode,
    CollapsibleTitleNode,
    CollapsibleContentNode,
  ],
  export: (node) => {
    if (!$isCollapsibleContainerNode(node)) return null;
    const title = node.getChildren().find($isCollapsibleTitleNode);
    const content = node.getChildren().find($isCollapsibleContentNode);
    const summary = title ? $exportBlocks(title).replaceAll("\n", " ") : "";
    const body = content ? indent($exportBlocks(content)) : "";
    return `<details><summary>${summary}</summary>\n${body}${body ? "\n" : ""}</details>`;
  },
  handleImportAfterStartMatch: ({
    lines,
    rootNode,
    startLineIndex,
    startMatch,
  }) => {
    const end = findClosingLine(lines, startLineIndex, "details");
    if (end === -1) return null;

    let bodyStart = startLineIndex + 1;
    let summary = SUMMARY.exec(
      lines[startLineIndex]!.slice(startMatch[0].length),
    )?.[1];
    if (summary === undefined) {
      const nextLine = lines[bodyStart] ?? "";
      summary = SUMMARY.exec(nextLine)?.[1];
      if (summary !== undefined) bodyStart++;
    }

    const isOpen = "open" in attributesOf(startMatch[1]);
    const title = $createCollapsibleTitleNode();
    const content = $createCollapsibleContentNode();
    $importBlocks(summary ?? "", title);
    $importBlocks(dedent(lines.slice(bodyStart, end)), content);

    rootNode.append(
      $createCollapsibleContainerNode(isOpen).append(title, content),
    );
    return [true, end];
  },
  regExpStart: DETAILS_START,
  // Import goes through handleImportAfterStartMatch; there is no shortcut.
  replace: () => false,
  type: "multiline-element",
};

export const CALLOUT: MultilineElementTransformer = {
  dependencies: [CalloutNode],
  export: (node) => {
    if (!$isCalloutNode(node)) return null;
    const attributes = [
      node.getIcon() && ` icon="${escapeAttribute(node.getIcon())}"`,
      node.getColor() && ` color="${escapeAttribute(node.getColor())}"`,
    ].join("");
    const body = indent($exportBlocks(node));
    return `<callout${attributes}>\n${body}${body ? "\n" : ""}</callout>`;
  },
  handleImportAfterStartMatch: ({
    lines,
    rootNode,
    startLineIndex,
    startMatch,
  }) => {
    const end = findClosingLine(lines, startLineIndex, "callout");
    if (end === -1) return null;

    const attributes = attributesOf(startMatch[1]);
    const callout = $createCalloutNode(
      unescapeAttribute(attributes.icon ?? ""),
      unescapeAttribute(attributes.color ?? ""),
    );
    $importBlocks(dedent(lines.slice(startLineIndex + 1, end)), callout);

    rootNode.append(callout);
    return [true, end];
  },
  regExpStart: CALLOUT_START,
  replace: () => false,
  type: "multiline-element",
};

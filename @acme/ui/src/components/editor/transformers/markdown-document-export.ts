import type { ElementTransformer, Transformer } from "@lexical/markdown";
import type { ElementNode } from "lexical";
import { $convertToMarkdownString } from "@lexical/markdown";

import {
  CONTINUATION,
  EMPTY_CONTINUATION,
} from "./markdown-continuation-transformer";
import {
  CHECK_BLOCK,
  MARKDOWN_DOCUMENT_TRANSFORMERS,
} from "./markdown-transformers";

// Private-use code points: never produced by the transformers, and not
// something a person types, so they can bracket a check line unambiguously.
const CHECK_LINE_START = "";
const CHECK_LINE_END = "";

const marked = (transformer: ElementTransformer): ElementTransformer => ({
  ...transformer,
  export: (node, traverseChildren) => {
    const line = transformer.export(node, traverseChildren);
    return line === null ? null : `${CHECK_LINE_START}${line}${CHECK_LINE_END}`;
  },
});

// Words under a to-do join its list too: a blank line before an indented
// line would make it a code block.
const DOCUMENT_EXPORT_TRANSFORMERS: Array<Transformer> =
  MARKDOWN_DOCUMENT_TRANSFORMERS.map((transformer) =>
    transformer === CHECK_BLOCK || transformer === CONTINUATION
      ? marked(transformer)
      : transformer,
  );

const BLANK_LINE_BETWEEN_CHECK_LINES = new RegExp(
  `${CHECK_LINE_END}\\n\\n(?=${CHECK_LINE_START})`,
  "g",
);
// An empty line under a to-do, with the line break before it.
const EMPTY_CONTINUATION_LINE = new RegExp(
  `\\n?${CHECK_LINE_START}${EMPTY_CONTINUATION}${CHECK_LINE_END}`,
  "g",
);
const CHECK_LINE_MARKS = new RegExp(
  `[${CHECK_LINE_START}${CHECK_LINE_END}]`,
  "g",
);

/**
 * Export a whole document as markdown.
 *
 * Use this instead of `$convertToMarkdownString(MARKDOWN_DOCUMENT_TRANSFORMERS)`.
 * Lexical puts a blank line between every pair of top-level blocks, and each
 * checklist item is its own top-level CheckBlockNode (unlike a bullet list,
 * which is one ListNode), so a checklist came out as `- [ ] a\n\n- [ ] b` — a
 * "loose" list that rewrites every hand-written `.md` checklist on first save.
 * Consecutive check items are joined back into a tight list; an empty
 * paragraph between them still exports as its own blank line, so a deliberate
 * gap survives.
 */
export function $convertToMarkdownDocument(node?: ElementNode): string {
  return $convertToMarkdownString(DOCUMENT_EXPORT_TRANSFORMERS, node)
    .replaceAll(BLANK_LINE_BETWEEN_CHECK_LINES, "\n")
    .replaceAll(EMPTY_CONTINUATION_LINE, "")
    .replaceAll(CHECK_LINE_MARKS, "");
}

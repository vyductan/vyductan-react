import type { TextMatchTransformer } from "@lexical/markdown";
import { $isLineBreakNode, TextNode } from "lexical";

import { INTRAWORD_UNDERSCORE } from "./markdown-intraword-underscore";

// What opens a block when it starts a line: a list marker, a heading, a
// quote, a fence, a rule.
const BLOCK_START =
  /^(?:[-*+](?=\s)|\d{1,9}[.)](?=\s)|#{1,6}(?=\s)|>|`{3}|~{3}|(?:-\s*){3,}$|(?:_\s*){3,}$)/;

/**
 * A line of its own inside a block (Shift+Enter) written so it stays one.
 *
 * Lexical writes the line break as a new line, and a line that starts like
 * a block — "- Plan" under a to-do, "1. first" in a paragraph — read back
 * as that block: a list of its own. Its first character is escaped, as
 * markdown escapes it, and reads back as it was.
 *
 * Export only. It takes the text node before INTRAWORD_UNDERSCORE would,
 * so it writes what that writes, then escapes.
 */
export const LINE_START_ESCAPE: TextMatchTransformer = {
  dependencies: [TextNode],
  export: (node, exportChildren, exportFormat) => {
    if (node.getType() !== "text" || !(node instanceof TextNode)) return null;
    if (!$isLineBreakNode(node.getPreviousSibling())) return null;
    const text = node.getTextContent();
    if (!BLOCK_START.test(text)) return null;
    const written =
      INTRAWORD_UNDERSCORE.export?.(node, exportChildren, exportFormat) ??
      exportFormat(node, text);
    if (!BLOCK_START.test(written)) return written;
    const number = /^(\d{1,9})([.)])/.exec(written);
    return number
      ? `${number[1]}\\${written.slice(number[1]!.length)}`
      : `\\${written}`;
  },
  // Nothing to read: markdown reads the escape itself.
  importRegExp: /(?!)/,
  regExp: /(?!)/,
  replace: () => undefined,
  type: "text-match",
};

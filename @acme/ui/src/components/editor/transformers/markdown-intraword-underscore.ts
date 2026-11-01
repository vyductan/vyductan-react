import type { TextMatchTransformer } from "@lexical/markdown";
import { TextNode } from "lexical";

// `\_` between two letters or digits — inside a word.
const ESCAPED_INTRAWORD_UNDERSCORE = /(?<=[\p{L}\p{N}])\\_(?=[\p{L}\p{N}])/gu;

/**
 * Words with underscores written as they are: `booking_id`, not
 * `booking\_id`.
 *
 * Lexical escapes every `_` in plain text it writes. One inside a word
 * cannot open or close emphasis in markdown, so the backslash only changed
 * the file: each save turned `snake_case` into `snake\_case` across it,
 * tables too. An underscore at a word's edge keeps its backslash; code has
 * none to lose.
 *
 * Export only: it takes a plain text node before Lexical's own text export
 * and hands back what that wrote, minus those backslashes.
 */
export const INTRAWORD_UNDERSCORE: TextMatchTransformer = {
  dependencies: [TextNode],
  export: (node, _exportChildren, exportFormat) => {
    if (node.getType() !== "text" || !(node instanceof TextNode)) return null;
    if (node.hasFormat("code")) return null;
    const text = node.getTextContent();
    if (!text.includes("_")) return null;
    return exportFormat(node, text).replaceAll(
      ESCAPED_INTRAWORD_UNDERSCORE,
      "_",
    );
  },
  // Nothing to read: markdown reads `snake_case` as it is.
  importRegExp: /(?!)/,
  regExp: /(?!)/,
  replace: () => undefined,
  type: "text-match",
};

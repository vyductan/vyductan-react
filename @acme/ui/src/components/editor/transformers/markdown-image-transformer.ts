import type {
  ElementTransformer,
  TextMatchTransformer,
} from "@lexical/markdown";

import type { ImageNode as ImageNodeType } from "../nodes/image-node";
import { $createImageNode, $isImageNode, ImageNode } from "../nodes/image-node";

/**
 * `![alt](src "caption")`: markdown's one place for words that go with an
 * image is its title, so a caption is kept there and lasts a save.
 */
const toMarkdown = (node: ImageNodeType): string | null => {
  const source = node.getSrc();
  // Skip blob URLs (temporary preview URLs that won't be valid after page reload)
  if (source.startsWith("blob:") || source.startsWith("data:")) {
    return null;
  }
  const caption = node.getCaptionText().replaceAll("\n", " ").trim();
  const title = caption
    ? ` "${caption.replaceAll("\\", "\\\\").replaceAll('"', String.raw`\"`)}"`
    : "";
  return `![${node.getAltText()}](${source}${title})`;
};

/**
 * `![alt](src title)`, the title in any of markdown's three forms: `"…"`,
 * `'…'` or `(…)`. Prettier writes `'…'` — format on save turned every
 * caption into one — and read with only `"…"` in mind, the title became
 * part of the path: the image broke and its caption was gone. Written back
 * always as `"…"`.
 */
const IMAGE_PATTERN = String.raw`!\[([^[]*)\]\(([^(]+?)(?:\s+(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|\(((?:[^()\\]|\\.)*)\)))?\)`;

export const IMAGE: TextMatchTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    return $isImageNode(node) ? toMarkdown(node) : null;
  },
  importRegExp: new RegExp(IMAGE_PATTERN),
  regExp: new RegExp(`${IMAGE_PATTERN}$`),
  replace: (textNode, match) => {
    const [, altText, source, double, single, parenthesized] = match;
    const title = double ?? single ?? parenthesized;
    const imageNode = $createImageNode({
      altText: altText ?? "",
      maxWidth: 800,
      src: source ?? "",
    });
    if (title) imageNode.setCaptionText(title.replaceAll(/\\(.)/g, "$1"));
    textNode.replace(imageNode);
  },
  trigger: ")",
  type: "text-match",
};

export const IMAGE_ELEMENT: ElementTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    return $isImageNode(node) ? toMarkdown(node) : null;
  },
  // We only use this for export, as import is handled by the text-match transformer
  regExp: /x^/,
  replace: () => {
    // No-op
  },
  type: "element",
};

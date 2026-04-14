/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import type {
  ElementTransformer,
  TextMatchTransformer,
} from "@lexical/markdown";

import { $createImageNode, $isImageNode, ImageNode } from "../nodes/image-node";

export const IMAGE: TextMatchTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    if (!$isImageNode(node)) {
      return null;
    }

    const source = node.getSrc();

    // Skip blob URLs (temporary preview URLs that won't be valid after page reload)
    if (source.startsWith("blob:") || source.startsWith("data:")) {
      return null;
    }

    return `![${node.getAltText()}](${source})`;
  },
  importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
  regExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
  replace: (textNode, match) => {
    const [, altText, source] = match;
    const imageNode = $createImageNode({
      altText: altText ?? "",
      maxWidth: 800,
      src: source ?? "",
    });
    textNode.replace(imageNode);
  },
  trigger: ")",
  type: "text-match",
};

export const IMAGE_ELEMENT: ElementTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    if (!$isImageNode(node)) {
      return null;
    }

    const source = node.getSrc();
    if (source.startsWith("blob:") || source.startsWith("data:")) {
      return null;
    }

    return `![${node.getAltText()}](${source})`;
  },
  // We only use this for export, as import is handled by the text-match transformer
  regExp: /x^/,
  replace: () => {
    // No-op
  },
  type: "element",
};

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

    const src = node.getSrc();

    // Skip blob URLs (temporary preview URLs that won't be valid after page reload)
    if (src.startsWith("blob:") || src.startsWith("data:")) {
      return null;
    }

    return `![${node.getAltText()}](${src})`;
  },
  importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
  regExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
  replace: (textNode, match) => {
    const [, altText, src] = match;
    const imageNode = $createImageNode({
      altText: altText ?? "",
      maxWidth: 800,
      src: src ?? "",
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

    const src = node.getSrc();
    if (src.startsWith("blob:") || src.startsWith("data:")) {
      return null;
    }

    return `![${node.getAltText()}](${src})`;
  },
  // We only use this for export, as import is handled by the text-match transformer
  regExp: /x^/,
  replace: () => {
    // No-op
  },
  type: "element",
};

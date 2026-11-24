import type { ElementNode, LexicalNode } from "lexical";
import { $isRootOrShadowRoot } from "lexical";

/**
 * Puts `line` right after the line `image` stands on: the image's paragraph,
 * or the image itself where it sits straight in a root (a cell, a callout).
 */
export function $insertLineAfterImage(image: LexicalNode, line: ElementNode) {
  const parent = image.getParent();
  const own = parent && !$isRootOrShadowRoot(parent) ? parent : image;
  own.insertAfter(line);
}

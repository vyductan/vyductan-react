import type { HeadingTagType } from "@lexical/rich-text";
import type { DOMConversionMap, DOMConversionOutput } from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";

/**
 * `<div role="heading" aria-level="3">` is a heading spelled in ARIA instead of
 * a tag. Google's results (the AI overview among them) title their sections
 * this way, and Lexical's import knows only `h1`–`h6`, so those titles pasted
 * in as plain paragraphs. ARIA's default level is 2; anything past 6 is a 6.
 */
function convertAriaHeading(element: HTMLElement) {
  if (element.getAttribute("role") !== "heading") return null;

  const level = Number.parseInt(element.getAttribute("aria-level") ?? "", 10);
  const tag =
    `h${Number.isNaN(level) ? 2 : Math.min(Math.max(level, 1), 6)}` as HeadingTagType;

  return {
    conversion: (): DOMConversionOutput => ({ node: $createHeadingNode(tag) }),
    priority: 1 as const,
  };
}

export const ariaHeadingHtmlImportMap: DOMConversionMap = {
  div: convertAriaHeading,
  p: convertAriaHeading,
};

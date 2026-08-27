import type { DOMConversionMap, DOMConversionOutput } from "lexical";
import { $isTextNode } from "lexical";

import { sanitizeInlineStyle } from "../render/parse-inline-style";

/**
 * Lexical's default HTML import reads `style` only where it maps onto a text
 * format (`font-weight`, `font-style`, `text-decoration`). Everything else —
 * `color`, `background-color`, `font-size`, `font-family` — is discarded, so
 * reopening saved content and saving it again silently erased the author's
 * colors, and `EditorRender format="html"` published them stripped.
 *
 * Only `<span>` is handled: `$patchStyleText` applies styling to text nodes, and
 * the exporter wraps those in a bare `<span style>`, so that element is the whole
 * of our own round trip. A block element carrying `style` (pasted from elsewhere)
 * still loses it — that would need the element's default conversion to run first,
 * which this hook cannot do.
 */
export const inlineStyleHtmlImportMap: DOMConversionMap = {
  span: (element: HTMLElement) => {
    const style = sanitizeInlineStyle(element.getAttribute("style") ?? "");

    if (!style) {
      // Fall through to Lexical's own handling for unstyled spans.
      return null;
    }

    return {
      conversion: (): DOMConversionOutput => ({
        // A span produces no node of its own; it only decorates its children.
        node: null,
        forChild: (child) => {
          // A nested span already carrying style is more specific, so it wins.
          if ($isTextNode(child) && !child.getStyle()) {
            child.setStyle(style);
          }

          return child;
        },
      }),
      priority: 1,
    };
  },
};

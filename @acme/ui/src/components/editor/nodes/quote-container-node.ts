import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  SerializedElementNode,
} from "lexical";
import { addClassNamesToElement } from "@lexical/utils";
import { $applyNodeReplacement, ElementNode } from "lexical";

/**
 * A quote that holds blocks — a list, and lines around it — as Notion's
 * does: "- " or "1. " at the start of a quote makes a list inside it, and
 * markdown's `> - item` reads as one.
 *
 * A quote of words alone stays Lexical's QuoteNode; this is the quote once it
 * holds a list. It draws as one (the theme's `quote` class on a
 * <blockquote>), so a reader cannot tell them apart, and in markdown it is
 * the same `> ` lines.
 */
export class QuoteContainerNode extends ElementNode {
  static getType(): string {
    return "quote-container";
  }

  static clone(node: QuoteContainerNode): QuoteContainerNode {
    return new QuoteContainerNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("blockquote");
    dom.dataset.quoteContainer = "true";
    addClassNamesToElement(dom, config.theme.quote);
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      // A pasted quote that holds a list keeps it.
      blockquote: (domNode: HTMLElement) =>
        domNode.querySelector(":scope > ul, :scope > ol")
          ? { conversion: $convertQuoteContainer, priority: 1 }
          : null,
    };
  }

  exportDOM(): DOMExportOutput {
    return { element: document.createElement("blockquote") };
  }

  static importJSON(serialized: SerializedElementNode): QuoteContainerNode {
    return $createQuoteContainerNode().updateFromJSON(serialized);
  }

  // Blocks inside behave as at the top level: lists, Enter, block menus.
  isShadowRoot(): boolean {
    return true;
  }
}

function $convertQuoteContainer(): DOMConversionOutput {
  return { node: $createQuoteContainerNode() };
}

export function $createQuoteContainerNode(): QuoteContainerNode {
  return $applyNodeReplacement(new QuoteContainerNode());
}

export function $isQuoteContainerNode(
  node: LexicalNode | null | undefined,
): node is QuoteContainerNode {
  return node instanceof QuoteContainerNode;
}

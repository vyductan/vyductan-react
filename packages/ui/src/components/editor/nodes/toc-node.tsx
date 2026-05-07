/**
 * Table of Contents Node
 *
 * Node để render Table of Contents trong Lexical editor
 * Tự động extract headings và tạo TOC với links
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import type { JSX } from "react";
import * as React from "react";
import { Suspense } from "react";
import { $applyNodeReplacement, DecoratorNode } from "lexical";

const TOCComponent = React.lazy(() => import("../editor-ui/toc-component"));

export interface TOCPayload {
  headings?: Array<{
    id: string;
    text: string;
    level: number;
  }>;
}

function $convertTOCElement(domNode: Node): null | DOMConversionOutput {
  const element = domNode as HTMLElement;
  if (Object.hasOwn(element.dataset, "lexicalToc")) {
    const node = $createTOCNode();
    return { node };
  }
  return null;
}

export type SerializedTOCNode = Spread<
  {
    headings?: Array<{
      id: string;
      text: string;
      level: number;
    }>;
  },
  SerializedLexicalNode
>;

export class TOCNode extends DecoratorNode<JSX.Element> {
  __headings?: Array<{
    id: string;
    text: string;
    level: number;
  }>;

  static getType(): string {
    return "toc";
  }

  static clone(node: TOCNode): TOCNode {
    return new TOCNode(node.__headings, node.__key);
  }

  static importJSON(serializedNode: SerializedTOCNode): TOCNode {
    return $createTOCNode(serializedNode.headings);
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.dataset.lexicalToc = "true";
    element.className = "toc-container";
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: Node) => {
        const element = node as HTMLElement;
        if (Object.hasOwn(element.dataset, "lexicalToc")) {
          return {
            conversion: $convertTOCElement,
            priority: 0,
          };
        }
        return null;
      },
    };
  }

  constructor(
    headings?: Array<{
      id: string;
      text: string;
      level: number;
    }>,
    key?: NodeKey,
  ) {
    super(key);
    this.__headings = headings;
  }

  exportJSON(): SerializedTOCNode {
    return {
      headings: this.__headings,
      type: "toc",
      version: 1,
    };
  }

  getHeadings():
    | Array<{ id: string; text: string; level: number }>
    | undefined {
    return this.__headings;
  }

  setHeadings(
    headings: Array<{ id: string; text: string; level: number }>,
  ): void {
    const writable = this.getWritable();
    writable.__headings = headings;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    return (
      <Suspense fallback={<div>Loading TOC...</div>}>
        <TOCComponent
          headings={this.__headings}
          nodeKey={this.__key}
          editor={_editor}
        />
      </Suspense>
    );
  }
}

export function $createTOCNode(
  headings?: Array<{ id: string; text: string; level: number }>,
): TOCNode {
  return $applyNodeReplacement(new TOCNode(headings));
}

export function $isTOCNode(
  node: LexicalNode | null | undefined,
): node is TOCNode {
  return node instanceof TOCNode;
}

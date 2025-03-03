/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
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
import { DecoratorNode } from "lexical";

type Dimension = number | "inherit";

const ExcalidrawComponent = React.lazy(
  () => import("../editor-ui/excalidraw-component"),
);

export type SerializedExcalidrawNode = Spread<
  {
    data: string;
    width?: Dimension;
    height?: Dimension;
  },
  SerializedLexicalNode
>;

function $convertExcalidrawElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {
  const excalidrawData = domNode.dataset.lexicalExcalidrawJson;
  const styleAttributes = globalThis.getComputedStyle(domNode);
  const heightStr = styleAttributes.getPropertyValue("height");
  const widthStr = styleAttributes.getPropertyValue("width");
  const height =
    !heightStr || heightStr === "inherit"
      ? "inherit"
      : Number.parseInt(heightStr, 10);
  const width =
    !widthStr || widthStr === "inherit"
      ? "inherit"
      : Number.parseInt(widthStr, 10);

  if (excalidrawData) {
    const node = $createExcalidrawNode(excalidrawData, width, height);
    return {
      node,
    };
  }
  // eslint-disable-next-line unicorn/no-null
  return null;
}

export class ExcalidrawNode extends DecoratorNode<JSX.Element> {
  __data: string;
  __width: Dimension;
  __height: Dimension;

  static getType(): string {
    return "excalidraw";
  }

  static clone(node: ExcalidrawNode): ExcalidrawNode {
    return new ExcalidrawNode(
      node.__data,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedExcalidrawNode): ExcalidrawNode {
    return new ExcalidrawNode(
      serializedNode.data,
      serializedNode.width ?? "inherit",
      serializedNode.height ?? "inherit",
    );
  }

  exportJSON(): SerializedExcalidrawNode {
    return {
      data: this.__data,
      height: this.__height === "inherit" ? undefined : this.__height,
      type: "excalidraw",
      version: 1,
      width: this.__width === "inherit" ? undefined : this.__width,
    };
  }

  constructor(
    data = "[]",
    width: Dimension = "inherit",
    height: Dimension = "inherit",
    key?: NodeKey,
  ) {
    super(key);
    this.__data = data;
    this.__width = width;
    this.__height = height;
  }

  // View
  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  static importDOM(): DOMConversionMap<HTMLSpanElement> | null {
    return {
      span: (domNode: HTMLSpanElement) => {
        if (!Object.hasOwn(domNode.dataset, "lexicalExcalidrawJson")) {
          // eslint-disable-next-line unicorn/no-null
          return null;
        }
        return {
          conversion: $convertExcalidrawElement,
          priority: 1,
        };
      },
    };
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("span");

    element.style.display = "inline-block";

    const content = editor.getElementByKey(this.getKey());
    if (content !== null) {
      const svg = content.querySelector("svg");
      if (svg !== null) {
        element.innerHTML = svg.outerHTML;
      }
    }

    element.style.width =
      this.__width === "inherit" ? "inherit" : `${this.__width}px`;
    element.style.height =
      this.__height === "inherit" ? "inherit" : `${this.__height}px`;

    element.dataset.lexicalExcalidrawJson = this.__data;
    return { element };
  }

  setData(data: string): void {
    const self = this.getWritable();
    self.__data = data;
  }

  getWidth(): Dimension {
    return this.getLatest().__width;
  }

  setWidth(width: Dimension): void {
    const self = this.getWritable();
    self.__width = width;
  }

  getHeight(): Dimension {
    return this.getLatest().__height;
  }

  setHeight(height: Dimension): void {
    const self = this.getWritable();
    self.__height = height;
  }

  // decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
  decorate(): JSX.Element {
    return (
      <Suspense fallback={<></>}>
        <ExcalidrawComponent
          nodeKey={this.getKey()}
          data={this.__data}
          width={this.__width}
          height={this.__height}
        />
      </Suspense>
    );
  }
}

export function $createExcalidrawNode(
  data = "[]",
  width: Dimension = "inherit",
  height: Dimension = "inherit",
): ExcalidrawNode {
  return new ExcalidrawNode(data, width, height);
}

export function $isExcalidrawNode(
  node: LexicalNode | null | undefined,
): node is ExcalidrawNode {
  return node instanceof ExcalidrawNode;
}

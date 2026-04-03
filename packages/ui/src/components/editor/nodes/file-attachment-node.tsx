/**
 * File Attachment Node
 *
 * Node để render file attachment trong Lexical editor
 * Hỗ trợ các loại file: PDF, DOCX, XLSX, PPTX, ZIP, etc.
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

const FileAttachmentComponent = React.lazy(
  () => import("../editor-ui/file-attachment-component"),
);

export interface FileAttachmentPayload {
  fileName: string;
  fileUrl: string;
  fileSize?: number; // in bytes
  mimeType?: string;
  description?: string;
}

function $convertFileAttachmentElement(
  domNode: Node,
): null | DOMConversionOutput {
  const element = domNode as HTMLElement;
  const fileName = element.dataset.fileName ?? "File";
  const fileUrl = element.dataset.fileUrl ?? "";
  const fileSize = element.dataset.fileSize
    ? Number.parseInt(element.dataset.fileSize, 10)
    : undefined;
  const mimeType = element.dataset.mimeType ?? undefined;
  const description = element.dataset.description ?? undefined;

  if (!fileUrl) {
    return null;
  }

  const node = $createFileAttachmentNode({
    fileName,
    fileUrl,
    fileSize,
    mimeType,
    description,
  });
  return { node };
}

export type SerializedFileAttachmentNode = Spread<
  {
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    description?: string;
  },
  SerializedLexicalNode
>;

export class FileAttachmentNode extends DecoratorNode<JSX.Element> {
  __fileName: string;
  __fileUrl: string;
  __fileSize?: number;
  __mimeType?: string;
  __description?: string;

  static getType(): string {
    return "file-attachment";
  }

  static clone(node: FileAttachmentNode): FileAttachmentNode {
    return new FileAttachmentNode(
      node.__fileName,
      node.__fileUrl,
      node.__fileSize,
      node.__mimeType,
      node.__description,
      node.__key,
    );
  }

  static importJSON(
    serializedNode: SerializedFileAttachmentNode,
  ): FileAttachmentNode {
    const { fileName, fileUrl, fileSize, mimeType, description } =
      serializedNode;
    return $createFileAttachmentNode({
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      description,
    });
  }

  exportDOM(): DOMExportOutput {
    // Export as markdown link: [filename](fileUrl)
    const anchor = document.createElement("a");
    anchor.href = this.__fileUrl;
    anchor.textContent = this.__fileName;
    anchor.dataset.fileAttachment = "true";

    // Add metadata as data attributes for potential import
    if (this.__fileSize) {
      anchor.dataset.fileSize = this.__fileSize.toString();
    }
    if (this.__mimeType) {
      anchor.dataset.mimeType = this.__mimeType;
    }
    if (this.__description) {
      anchor.title = this.__description;
    }

    return { element: anchor };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: Node) => {
        const element = node as HTMLElement;
        if (Object.hasOwn(element.dataset, "fileUrl")) {
          return {
            conversion: $convertFileAttachmentElement,
            priority: 0,
          };
        }
        return null;
      },
    };
  }

  constructor(
    fileName: string,
    fileUrl: string,
    fileSize?: number,
    mimeType?: string,
    description?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__fileName = fileName;
    this.__fileUrl = fileUrl;
    this.__fileSize = fileSize;
    this.__mimeType = mimeType;
    this.__description = description;
  }

  exportJSON(): SerializedFileAttachmentNode {
    return {
      fileName: this.__fileName,
      fileUrl: this.__fileUrl,
      fileSize: this.__fileSize,
      mimeType: this.__mimeType,
      description: this.__description,
      type: "file-attachment",
      version: 1,
    };
  }

  getFileName(): string {
    return this.__fileName;
  }

  getFileUrl(): string {
    return this.__fileUrl;
  }

  getFileSize(): number | undefined {
    return this.__fileSize;
  }

  getMimeType(): string | undefined {
    return this.__mimeType;
  }

  setFileName(fileName: string): void {
    const writable = this.getWritable();
    writable.__fileName = fileName;
  }

  setFileUrl(fileUrl: string): void {
    const writable = this.getWritable();
    writable.__fileUrl = fileUrl;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    return (
      <Suspense fallback={null}>
        <FileAttachmentComponent
          fileName={this.__fileName}
          fileUrl={this.__fileUrl}
          fileSize={this.__fileSize}
          mimeType={this.__mimeType}
          description={this.__description}
          nodeKey={this.__key}
        />
      </Suspense>
    );
  }
}

export function $createFileAttachmentNode({
  fileName,
  fileUrl,
  fileSize,
  mimeType,
  description,
}: FileAttachmentPayload): FileAttachmentNode {
  return $applyNodeReplacement(
    new FileAttachmentNode(fileName, fileUrl, fileSize, mimeType, description),
  );
}

export function $isFileAttachmentNode(
  node: LexicalNode | null | undefined,
): node is FileAttachmentNode {
  return node instanceof FileAttachmentNode;
}

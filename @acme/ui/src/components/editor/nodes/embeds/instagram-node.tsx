/**
 * Instagram Embed Node
 *
 * Node để embed Instagram posts vào Lexical editor
 * Hỗ trợ Instagram URL: https://www.instagram.com/p/ABC123/
 */

import type { SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from "lexical";
import type { JSX } from "react";
import { useEffect } from "react";
import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import { DecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";

type InstagramComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  postId: string;
}>;

function InstagramComponent({
  className,
  format,
  nodeKey,
  postId,
}: InstagramComponentProps) {
  useEffect(() => {
    // Load Instagram embed script
    if (globalThis.instgrm) {
      globalThis.instgrm.Embeds.process();
    } else {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.append(script);

      script.addEventListener("load", () => {
        globalThis.instgrm?.Embeds.process();
      });
    }
  }, [postId]);

  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <blockquote
        className="instagram-media"
        data-instgrm-captioned
        data-instgrm-permalink={`https://www.instagram.com/p/${postId}/`}
        data-instgrm-version="14"
        style={{
          background: "#FFF",
          border: "0",
          borderRadius: "3px",
          boxShadow: "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
          margin: "1px",
          maxWidth: "540px",
          minWidth: "326px",
          padding: "0",
          width: "99.375%",
        }}
      >
        <div style={{ padding: "16px" }}>
          <a
            href={`https://www.instagram.com/p/${postId}/`}
            style={{
              background: "#FFFFFF",
              lineHeight: "0",
              padding: "0 0",
              textAlign: "center",
              textDecoration: "none",
              width: "100%",
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            View this post on Instagram
          </a>
        </div>
      </blockquote>
    </BlockWithAlignableContents>
  );
}

export type SerializedInstagramNode = Spread<
  {
    postId: string;
  },
  SerializedDecoratorBlockNode
>;

function $convertInstagramElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const postId = domNode.dataset.lexicalInstagram;
  if (postId) {
    const node = $createInstagramNode(postId);
    return { node };
  }
  return null;
}

export class InstagramNode extends DecoratorBlockNode {
  __id: string;

  static getType(): string {
    return "instagram";
  }

  static clone(node: InstagramNode): InstagramNode {
    return new InstagramNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedInstagramNode): InstagramNode {
    const node = $createInstagramNode(serializedNode.postId);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedInstagramNode {
    return {
      ...super.exportJSON(),
      type: "instagram",
      version: 1,
      postId: this.__id,
    };
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("blockquote");
    element.dataset.lexicalInstagram = this.__id;
    element.className = "instagram-media";
    element.dataset.instgrmPermalink = `https://www.instagram.com/p/${this.__id}/`;
    element.dataset.instgrmVersion = "14";
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      blockquote: (domNode: HTMLElement) => {
        if (!Object.hasOwn(domNode.dataset, "lexicalInstagram")) {
          return null;
        }
        return {
          conversion: $convertInstagramElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.__id;
  }

  getTextContent(
    _includeInert?: boolean,
    _includeDirectionless?: false,
  ): string {
    return `https://www.instagram.com/p/${this.__id}/`;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock ?? {};
    const className = {
      base: embedBlockTheme.base ?? "",
      focus: embedBlockTheme.focus ?? "",
    };
    return (
      <InstagramComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        postId={this.__id}
      />
    );
  }
}

export function $createInstagramNode(postId: string): InstagramNode {
  return new InstagramNode(postId);
}

export function $isInstagramNode(
  node: InstagramNode | LexicalNode | null | undefined,
): node is InstagramNode {
  return node instanceof InstagramNode;
}

// Extend globalThis for Instagram embed
declare global {
  var instgrm:
    | {
        Embeds: {
          process: () => void;
        };
      }
    | undefined;
}

/**
 * TikTok Embed Node
 *
 * Node để embed TikTok videos vào Lexical editor
 * Hỗ trợ TikTok URL: https://www.tiktok.com/@username/video/1234567890
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

type TikTokComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  videoId: string;
  username?: string;
}>;

function TikTokComponent({
  className,
  format,
  nodeKey,
  videoId,
  username,
}: TikTokComponentProps) {
  useEffect(() => {
    // Load TikTok embed script
    if (!globalThis.tiktokEmbed) {
      const script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      document.body.append(script);
    }
  }, [videoId]);

  const embedUrl = username
    ? `https://www.tiktok.com/@${username}/video/${videoId}`
    : `https://www.tiktok.com/embed/v2/${videoId}`;

  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <blockquote
        className="tiktok-embed"
        cite={embedUrl}
        data-video-id={videoId}
        style={{ maxWidth: "325px", minWidth: "325px" }}
      >
        <section>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={embedUrl}
            title={username ? `@${username}` : "TikTok video"}
          >
            View on TikTok
          </a>
        </section>
      </blockquote>
    </BlockWithAlignableContents>
  );
}

export type SerializedTikTokNode = Spread<
  {
    videoId: string;
    username?: string;
  },
  SerializedDecoratorBlockNode
>;

function $convertTikTokElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const videoId = domNode.dataset.lexicalTiktok ?? undefined;
  const username = domNode.dataset.lexicalTiktokUsername ?? undefined;
  if (videoId) {
    const node = $createTikTokNode(videoId, username ?? undefined);
    return { node };
  }
  return null;
}

export class TikTokNode extends DecoratorBlockNode {
  __id: string;
  __username?: string;

  static getType(): string {
    return "tiktok";
  }

  static clone(node: TikTokNode): TikTokNode {
    return new TikTokNode(
      node.__id,
      node.__format,
      node.__key,
      node.__username,
    );
  }

  static importJSON(serializedNode: SerializedTikTokNode): TikTokNode {
    const node = $createTikTokNode(
      serializedNode.videoId,
      serializedNode.username,
    );
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedTikTokNode {
    return {
      ...super.exportJSON(),
      type: "tiktok",
      version: 1,
      videoId: this.__id,
      username: this.__username,
    };
  }

  constructor(
    id: string,
    format?: ElementFormatType,
    key?: NodeKey,
    username?: string,
  ) {
    super(format, key);
    this.__id = id;
    this.__username = username;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("blockquote");
    element.dataset.lexicalTiktok = this.__id;
    if (this.__username) {
      element.dataset.lexicalTiktokUsername = this.__username;
    }
    element.className = "tiktok-embed";
    const embedUrl = this.__username
      ? `https://www.tiktok.com/@${this.__username}/video/${this.__id}`
      : `https://www.tiktok.com/embed/v2/${this.__id}`;
    element.setAttribute("cite", embedUrl);
    element.dataset.videoId = this.__id;
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      blockquote: (domNode: HTMLElement) => {
        if (!Object.hasOwn(domNode.dataset, "lexicalTiktok")) {
          return null;
        }
        return {
          conversion: $convertTikTokElement,
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
    if (this.__username) {
      return `https://www.tiktok.com/@${this.__username}/video/${this.__id}`;
    }
    return `https://www.tiktok.com/embed/v2/${this.__id}`;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock ?? {};
    const className = {
      base: embedBlockTheme.base ?? "",
      focus: embedBlockTheme.focus ?? "",
    };
    return (
      <TikTokComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        videoId={this.__id}
        username={this.__username}
      />
    );
  }
}

export function $createTikTokNode(
  videoId: string,
  username?: string,
): TikTokNode {
  return new TikTokNode(videoId, undefined, undefined, username);
}

export function $isTikTokNode(
  node: TikTokNode | LexicalNode | null | undefined,
): node is TikTokNode {
  return node instanceof TikTokNode;
}

// Extend Window interface for TikTok embed
declare global {
  interface Window {
    tiktokEmbed?: unknown;
  }

  // Also extend globalThis for better compatibility
  var tiktokEmbed: unknown;
}

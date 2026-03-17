/**
 * Twitter Embed Node
 *
 * Node để embed Twitter tweets vào Lexical editor
 * Hỗ trợ Twitter URL: https://twitter.com/username/status/1234567890
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

type TwitterComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  tweetId: string;
}>;

function TwitterComponent({
  className,
  format,
  nodeKey,
  tweetId,
}: TwitterComponentProps) {
  useEffect(() => {
    // Load Twitter widget script
    if (globalThis.twttr) {
      globalThis.twttr.widgets.load();
    } else {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf8";
      document.body.append(script);

      script.addEventListener("load", () => {
        if (globalThis.twttr?.widgets) {
          globalThis.twttr.widgets.load();
        }
      });
    }
  }, [tweetId]);

  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <blockquote
        className="twitter-tweet"
        data-theme="light"
        data-dnt="true"
        data-lang="en"
      >
        <a href={`https://twitter.com/x/status/${tweetId}`}>Loading tweet...</a>
      </blockquote>
    </BlockWithAlignableContents>
  );
}

export type SerializedTwitterNode = Spread<
  {
    tweetId: string;
  },
  SerializedDecoratorBlockNode
>;

function $convertTwitterElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const tweetId = domNode.dataset.lexicalTwitter;
  if (tweetId) {
    const node = $createTwitterNode(tweetId);
    return { node };
  }
  return null;
}

export class TwitterNode extends DecoratorBlockNode {
  __id: string;

  static getType(): string {
    return "twitter";
  }

  static clone(node: TwitterNode): TwitterNode {
    return new TwitterNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedTwitterNode): TwitterNode {
    const node = $createTwitterNode(serializedNode.tweetId);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedTwitterNode {
    return {
      ...super.exportJSON(),
      type: "twitter",
      version: 1,
      tweetId: this.__id,
    };
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("blockquote");
    element.dataset.lexicalTwitter = this.__id;
    element.className = "twitter-tweet";
    element.dataset.theme = "light";
    element.dataset.dnt = "true";
    const link = document.createElement("a");
    link.href = `https://twitter.com/x/status/${this.__id}`;
    link.textContent = "Loading tweet...";
    element.append(link);
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      blockquote: (domNode: HTMLElement) => {
        if (!Object.hasOwn(domNode.dataset, "lexicalTwitter")) {
          return null;
        }
        return {
          conversion: $convertTwitterElement,
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
    return `https://twitter.com/x/status/${this.__id}`;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock ?? {};
    const className = {
      base: embedBlockTheme.base ?? "",
      focus: embedBlockTheme.focus ?? "",
    };
    return (
      <TwitterComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        tweetId={this.__id}
      />
    );
  }
}

export function $createTwitterNode(tweetId: string): TwitterNode {
  return new TwitterNode(tweetId);
}

export function $isTwitterNode(
  node: TwitterNode | LexicalNode | null | undefined,
): node is TwitterNode {
  return node instanceof TwitterNode;
}

// Extend globalThis for Twitter widget
declare global {
  var twttr:
    | {
        widgets: {
          load: () => void;
        };
      }
    | undefined;
}

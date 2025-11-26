/**
 * Video Node
 * 
 * Node để render video element trong Lexical editor
 * Hỗ trợ video files (upload) và video URLs
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

const VideoComponent = React.lazy(() => import("../editor-ui/video-component"));

export interface VideoPayload {
  altText: string;
  src: string;
  width?: number;
  height?: number;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

function $convertVideoElement(domNode: Node): null | DOMConversionOutput {
  const video = domNode as HTMLVideoElement;
  if (video.src.startsWith("file:///")) {
    return null;
  }
  const { src, width, height, controls, autoplay, loop, muted } = video;
  const altText = video.getAttribute("alt") || "Video";
  const node = $createVideoNode({
    altText,
    src,
    width: width || undefined,
    height: height || undefined,
    controls: controls !== undefined,
    autoplay: autoplay !== undefined,
    loop: loop !== undefined,
    muted: muted !== undefined,
  });
  return { node };
}

export type SerializedVideoNode = Spread<
  {
    altText: string;
    src: string;
    width?: number;
    height?: number;
    controls: boolean;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
  },
  SerializedLexicalNode
>;

export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: "inherit" | number;
  __height: "inherit" | number;
  __controls: boolean;
  __autoplay: boolean;
  __loop: boolean;
  __muted: boolean;

  static getType(): string {
    return "video";
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__controls,
      node.__autoplay,
      node.__loop,
      node.__muted,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const { altText, src, width, height, controls, autoplay, loop, muted } =
      serializedNode;
    return $createVideoNode({
      altText,
      src,
      width,
      height,
      controls,
      autoplay,
      loop,
      muted,
    });
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("video");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    if (this.__width !== "inherit") {
      element.setAttribute("width", this.__width.toString());
    }
    if (this.__height !== "inherit") {
      element.setAttribute("height", this.__height.toString());
    }
    if (this.__controls) {
      element.setAttribute("controls", "true");
    }
    if (this.__autoplay) {
      element.setAttribute("autoplay", "true");
    }
    if (this.__loop) {
      element.setAttribute("loop", "true");
    }
    if (this.__muted) {
      element.setAttribute("muted", "true");
    }
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      video: () => ({
        conversion: $convertVideoElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText: string,
    width?: "inherit" | number,
    height?: "inherit" | number,
    controls?: boolean,
    autoplay?: boolean,
    loop?: boolean,
    muted?: boolean,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width ?? "inherit";
    this.__height = height ?? "inherit";
    this.__controls = controls ?? true;
    this.__autoplay = autoplay ?? false;
    this.__loop = loop ?? false;
    this.__muted = muted ?? false;
  }

  exportJSON(): SerializedVideoNode {
    return {
      altText: this.getAltText(),
      autoplay: this.__autoplay,
      controls: this.__controls,
      height: this.__height === "inherit" ? undefined : this.__height,
      loop: this.__loop,
      muted: this.__muted,
      src: this.getSrc(),
      type: "video",
      version: 1,
      width: this.__width === "inherit" ? undefined : this.__width,
    };
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  setAltText(altText: string): void {
    const writable = this.getWritable();
    writable.__altText = altText;
  }

  setWidthAndHeight(width: "inherit" | number, height: "inherit" | number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return (
      <Suspense fallback={null}>
        <VideoComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          controls={this.__controls}
          autoplay={this.__autoplay}
          loop={this.__loop}
          muted={this.__muted}
          nodeKey={this.__key}
        />
      </Suspense>
    );
  }
}

export function $createVideoNode({
  altText,
  src,
  width,
  height,
  controls = true,
  autoplay = false,
  loop = false,
  muted = false,
}: VideoPayload): VideoNode {
  return $applyNodeReplacement(
    new VideoNode(src, altText, width, height, controls, autoplay, loop, muted),
  );
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode;
}


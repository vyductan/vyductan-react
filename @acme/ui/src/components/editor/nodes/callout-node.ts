import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  LexicalUpdateJSON,
  NodeKey,
  SerializedElementNode,
  Spread,
} from "lexical";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import {
  $applyNodeReplacement,
  $createParagraphNode,
  ElementNode,
} from "lexical";

/**
 * A Notion callout: blocks in a tinted box behind an icon.
 *
 * `icon` is an emoji and `color` one of Notion's color names ("blue_bg",
 * "red", …), both as Notion-flavored Markdown writes them:
 * `<callout icon="💡" color="blue_bg">`. Either may be empty — a callout read
 * without them is written back without them.
 *
 * The icon is drawn by CSS from `data-icon`, so it is not a child node the
 * caret could land in or the reconciler would have to work around.
 */
export type SerializedCalloutNode = Spread<
  { icon: string; color: string },
  SerializedElementNode
>;

export class CalloutNode extends ElementNode {
  __icon: string;
  __color: string;

  static getType(): string {
    return "callout";
  }

  static clone(node: CalloutNode): CalloutNode {
    return new CalloutNode(node.__icon, node.__color, node.__key);
  }

  constructor(icon = "", color = "", key?: NodeKey) {
    super(key);
    this.__icon = icon;
    this.__color = color;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement("div");
    dom.classList.add("Callout");
    this.syncDOM(dom);
    return dom;
  }

  updateDOM(previous: CalloutNode, dom: HTMLElement): boolean {
    if (previous.__icon !== this.__icon || previous.__color !== this.__color) {
      this.syncDOM(dom);
    }
    return false;
  }

  private syncDOM(dom: HTMLElement) {
    dom.dataset.icon = this.__icon;
    if (this.__color) dom.dataset.color = this.__color;
    else delete dom.dataset.color;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) =>
        Object.hasOwn(domNode.dataset, "lexicalCallout")
          ? { conversion: $convertCalloutElement, priority: 2 }
          : null,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.classList.add("Callout");
    element.dataset.lexicalCallout = "true";
    this.syncDOM(element);
    return { element };
  }

  static importJSON(serialized: SerializedCalloutNode): CalloutNode {
    return $createCalloutNode().updateFromJSON(serialized);
  }

  updateFromJSON(serialized: LexicalUpdateJSON<SerializedCalloutNode>): this {
    return super
      .updateFromJSON(serialized)
      .setIcon(serialized.icon)
      .setColor(serialized.color);
  }

  exportJSON(): SerializedCalloutNode {
    return {
      ...super.exportJSON(),
      icon: this.getIcon(),
      color: this.getColor(),
    };
  }

  getIcon(): string {
    return this.getLatest().__icon;
  }

  setIcon(icon: string): this {
    const writable = this.getWritable();
    writable.__icon = icon;
    return writable;
  }

  getColor(): string {
    return this.getLatest().__color;
  }

  setColor(color: string): this {
    const writable = this.getWritable();
    writable.__color = color;
    return writable;
  }

  // Blocks inside behave as at the top level: lists, headings, block menus.
  isShadowRoot(): boolean {
    return true;
  }
}

function $convertCalloutElement(domNode: HTMLElement): DOMConversionOutput {
  return {
    node: $createCalloutNode(
      domNode.dataset.icon ?? "",
      domNode.dataset.color ?? "",
    ),
  };
}

export function $createCalloutNode(icon = "", color = ""): CalloutNode {
  return $applyNodeReplacement(new CalloutNode(icon, color));
}

export function $isCalloutNode(
  node: LexicalNode | null | undefined,
): node is CalloutNode {
  return node instanceof CalloutNode;
}

/**
 * The backgrounds the callout picker offers: Notion's, by the names its
 * markdown uses. "" is the default tint. Their colors live in
 * themes/editor-theme.css.
 */
export const CALLOUT_COLORS = [
  { color: "", label: "Default" },
  { color: "gray_bg", label: "Gray" },
  { color: "brown_bg", label: "Brown" },
  { color: "orange_bg", label: "Orange" },
  { color: "yellow_bg", label: "Yellow" },
  { color: "green_bg", label: "Green" },
  { color: "blue_bg", label: "Blue" },
  { color: "purple_bg", label: "Purple" },
  { color: "pink_bg", label: "Pink" },
  { color: "red_bg", label: "Red" },
] as const;

/** What "/callout" puts in, as Notion does: 💡 on a gray tint. */
export const DEFAULT_CALLOUT = { icon: "💡", color: "gray_bg" } as const;

/** Insert an empty default callout at the selection, caret inside it. */
export function $insertCallout(): void {
  const paragraph = $createParagraphNode();
  $insertNodeToNearestRoot(
    $createCalloutNode(DEFAULT_CALLOUT.icon, DEFAULT_CALLOUT.color).append(
      paragraph,
    ),
  );
  paragraph.select();
}

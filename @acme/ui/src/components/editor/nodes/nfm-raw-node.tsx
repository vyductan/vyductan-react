import type {
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import type React from "react";
import { useCallback, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $applyNodeReplacement,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from "lexical";

/**
 * Notion-flavored Markdown the editor does not model, kept byte for byte.
 *
 * Child pages, databases, Notion's HTML-ish tables, columns, synced blocks,
 * media, mentions, colored spans: each is read into one of these nodes as the
 * exact markup Notion wrote, shown as a read-only chip, and written back
 * unchanged. Editing the text around one can never rewrite it — which is
 * what makes pushing a page back to Notion safe. A chip can be selected and
 * deleted; changing what is inside it is done in Notion.
 *
 * `markup` is the source with the block's own indentation removed; a
 * container (callout, toggle) adds its depth back on export.
 */

export type SerializedNfmRawNode = Spread<
  { markup: string },
  SerializedLexicalNode
>;

const TAG = /^<\/?([\w-]+)/;
const ATTRIBUTE = (name: string) => new RegExp(String.raw`\b${name}="([^"]*)"`);

const tagOf = (markup: string) => TAG.exec(markup)?.[1] ?? "";
const attributeOf = (markup: string, name: string) =>
  ATTRIBUTE(name).exec(markup)?.[1];

/** The text between the first tag and its closing tag, tags stripped. */
const innerText = (markup: string) =>
  markup
    .replace(/^<[^>]*>/, "")
    .replace(/<\/[\w-]+>\s*$/, "")
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();

/** What a block chip says: kind and name. */
export function describeRawBlock(markup: string): {
  icon: string;
  label: string;
} {
  const tag = tagOf(markup);
  const text = innerText(markup);
  switch (tag) {
    case "page": {
      return { icon: "📄", label: text || "Notion page" };
    }
    case "database": {
      return { icon: "🗃️", label: text || "Notion database" };
    }
    case "table": {
      const rows = (markup.match(/<tr\b/g) ?? []).length;
      return {
        icon: "▦",
        label: `Notion table · ${rows} row${rows === 1 ? "" : "s"}`,
      };
    }
    case "columns": {
      const columns = (markup.match(/<column\b/g) ?? []).length;
      return { icon: "▥", label: `${columns} columns` };
    }
    case "synced_block":
    case "synced_block_reference": {
      return { icon: "🔗", label: "Synced block" };
    }
    case "table_of_contents": {
      return { icon: "☰", label: "Table of contents" };
    }
    case "empty-block": {
      return { icon: "", label: "" };
    }
    case "unknown": {
      return {
        icon: "?",
        label: `Not readable here: ${attributeOf(markup, "alt") ?? "block"}`,
      };
    }
    default: {
      // audio, video, file, pdf
      return { icon: "📎", label: text || attributeOf(markup, "src") || tag };
    }
  }
}

/** Click to select, Backspace/Delete to remove — as the page break does. */
function useSelectableChip(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);

  const $onDelete = useCallback(
    (event: KeyboardEvent) => {
      const selection = $getSelection();
      if (!isSelected || !$isNodeSelection(selection)) return false;
      event.preventDefault();
      for (const node of selection.getNodes()) {
        if ($isNfmRawBlockNode(node) || $isNfmRawInlineNode(node))
          node.remove();
      }
      return true;
    },
    [isSelected],
  );

  useEffect(
    () =>
      mergeRegister(
        editor.registerCommand(
          CLICK_COMMAND,
          (event: MouseEvent) => {
            const element = editor.getElementByKey(nodeKey);
            if (
              !element ||
              !(event.target instanceof Node) ||
              !element.contains(event.target)
            )
              return false;
            if (!event.shiftKey) clearSelection();
            setSelected(true);
            return true;
          },
          COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
          KEY_DELETE_COMMAND,
          $onDelete,
          COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
          KEY_BACKSPACE_COMMAND,
          $onDelete,
          COMMAND_PRIORITY_LOW,
        ),
      ),
    [clearSelection, editor, nodeKey, $onDelete, setSelected],
  );

  return isSelected;
}

function RawBlockChip({
  nodeKey,
  markup,
}: {
  nodeKey: NodeKey;
  markup: string;
}) {
  const isSelected = useSelectableChip(nodeKey);
  const { icon, label } = describeRawBlock(markup);
  const url = attributeOf(markup, "url") ?? attributeOf(markup, "src");
  return (
    <div
      className="NfmRaw NfmRaw--block"
      data-tag={tagOf(markup)}
      data-selected={isSelected || undefined}
      title={url ? `${url} — edit in Notion` : "Edit in Notion"}
    >
      {icon && <span className="NfmRaw__icon">{icon}</span>}
      {label}
    </div>
  );
}

function RawInlineChip({
  nodeKey,
  markup,
}: {
  nodeKey: NodeKey;
  markup: string;
}) {
  const isSelected = useSelectableChip(nodeKey);
  const tag = tagOf(markup);
  const text =
    tag === "mention-date"
      ? [attributeOf(markup, "start"), attributeOf(markup, "end")]
          .filter(Boolean)
          .join(" → ")
      : innerText(markup);
  return (
    <span
      className="NfmRaw NfmRaw--inline"
      data-tag={tag}
      data-color={attributeOf(markup, "color")}
      data-underline={attributeOf(markup, "underline")}
      data-selected={isSelected || undefined}
      title={attributeOf(markup, "url") ?? "Edit in Notion"}
    >
      {tag.startsWith("mention-") && tag !== "mention-date" ? `@${text}` : text}
    </span>
  );
}

abstract class NfmRawNode extends DecoratorNode<React.JSX.Element> {
  __markup: string;

  constructor(markup: string, key?: NodeKey) {
    super(key);
    this.__markup = markup;
  }

  getMarkup(): string {
    return this.getLatest().__markup;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    // Copy/paste into another editor: the markup itself, as text.
    const element = document.createElement(this.isInline() ? "span" : "div");
    element.textContent = this.__markup;
    return { element };
  }
}

export class NfmRawBlockNode extends NfmRawNode {
  static getType(): string {
    return "nfm-raw-block";
  }

  static clone(node: NfmRawBlockNode): NfmRawBlockNode {
    return new NfmRawBlockNode(node.__markup, node.__key);
  }

  static importJSON(serialized: SerializedNfmRawNode): NfmRawBlockNode {
    return $createNfmRawBlockNode(serialized.markup);
  }

  exportJSON(): SerializedNfmRawNode {
    return { ...super.exportJSON(), markup: this.getMarkup() };
  }

  createDOM(): HTMLElement {
    return document.createElement("div");
  }

  isInline(): false {
    return false;
  }

  getTextContent(): string {
    return describeRawBlock(this.__markup).label;
  }

  decorate(): React.JSX.Element {
    return <RawBlockChip nodeKey={this.getKey()} markup={this.__markup} />;
  }
}

export class NfmRawInlineNode extends NfmRawNode {
  static getType(): string {
    return "nfm-raw-inline";
  }

  static clone(node: NfmRawInlineNode): NfmRawInlineNode {
    return new NfmRawInlineNode(node.__markup, node.__key);
  }

  static importJSON(serialized: SerializedNfmRawNode): NfmRawInlineNode {
    return $createNfmRawInlineNode(serialized.markup);
  }

  exportJSON(): SerializedNfmRawNode {
    return { ...super.exportJSON(), markup: this.getMarkup() };
  }

  createDOM(): HTMLElement {
    return document.createElement("span");
  }

  isInline(): true {
    return true;
  }

  getTextContent(): string {
    return innerText(this.__markup);
  }

  decorate(): React.JSX.Element {
    return <RawInlineChip nodeKey={this.getKey()} markup={this.__markup} />;
  }
}

export function $createNfmRawBlockNode(markup: string): NfmRawBlockNode {
  return $applyNodeReplacement(new NfmRawBlockNode(markup));
}

export function $createNfmRawInlineNode(markup: string): NfmRawInlineNode {
  return $applyNodeReplacement(new NfmRawInlineNode(markup));
}

export function $isNfmRawBlockNode(
  node: LexicalNode | null | undefined,
): node is NfmRawBlockNode {
  return node instanceof NfmRawBlockNode;
}

export function $isNfmRawInlineNode(
  node: LexicalNode | null | undefined,
): node is NfmRawInlineNode {
  return node instanceof NfmRawInlineNode;
}

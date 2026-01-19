import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  RangeSelection,
  SerializedElementNode,
  Spread,
} from "lexical";
import { $applyNodeReplacement, ElementNode } from "lexical";

export type SerializedCheckBlockNode = Spread<
  {
    checked: boolean;
  },
  SerializedElementNode
>;

export class CheckBlockNode extends ElementNode {
  __checked: boolean;

  constructor(checked = false, key?: NodeKey) {
    super(key);
    this.__checked = checked;
  }

  static getType(): string {
    return "check-block";
  }

  static clone(node: CheckBlockNode): CheckBlockNode {
    return new CheckBlockNode(node.__checked, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div");
    const theme = config.theme;
    const className = theme.checkBlock as string | undefined;
    if (className) {
      div.className = className;
    }
    const checkBlockChecked = theme.checkBlockChecked as string | undefined;
    if (this.__checked && checkBlockChecked) {
      div.classList.add(...checkBlockChecked.split(" "));
    }
    return div;
  }

  updateDOM(
    prevNode: CheckBlockNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    const theme = config.theme;
    const checkedClass = theme.checkBlockChecked as string | undefined;

    if (prevNode.__checked !== this.__checked && checkedClass) {
      if (this.__checked) {
        dom.classList.add(...checkedClass.split(" "));
        dom.dataset.checked = "true";
      } else {
        dom.classList.remove(...checkedClass.split(" "));
        delete dom.dataset.checked;
      }
    }
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: HTMLElement) => {
        if (!node.classList.contains("check-block")) {
          return null;
        }
        return {
          conversion: convertCheckBlockElement,
          priority: 1,
        };
      },
      // Handle legacy or Notion-style checklist imports if needed here
    };
  }

  static importJSON(serializedNode: SerializedCheckBlockNode): CheckBlockNode {
    const node = $createCheckBlockNode(serializedNode.checked);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedCheckBlockNode {
    return {
      ...super.exportJSON(),
      checked: this.__checked,
      type: "check-block",
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.classList.add("check-block");
    if (this.__checked) {
      element.classList.add("check-block-checked");
      element.dataset.checked = "true";
    }
    return { element };
  }

  getChecked(): boolean {
    return this.__checked;
  }

  toggle(): void {
    const writable = this.getWritable();
    writable.__checked = !writable.__checked;
  }

  setChecked(checked: boolean): void {
    const writable = this.getWritable();
    writable.__checked = checked;
  }

  collapseAtStart(selection: RangeSelection): boolean {
    // If collapsing at start, maybe merge with previous?
    // Default element behavior implies merging.
    return super.collapseAtStart(selection);
  }
}

function convertCheckBlockElement(domNode: HTMLElement): DOMConversionOutput {
  const isChecked =
    domNode.classList.contains("check-block-checked") ||
    domNode.dataset.checked === "true";
  return {
    node: $createCheckBlockNode(isChecked),
  };
}

export function $createCheckBlockNode(checked = false): CheckBlockNode {
  return $applyNodeReplacement(new CheckBlockNode(checked));
}

export function $isCheckBlockNode(
  node: LexicalNode | null | undefined,
): node is CheckBlockNode {
  return node instanceof CheckBlockNode;
}

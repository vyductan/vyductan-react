import type { Transformer } from "@lexical/markdown";
import {
  $createListNode,
  $isListItemNode,
  $isListNode,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import {
  ELEMENT_TRANSFORMERS,
  // MULTILINE_ELEMENT_TRANSFORMERS - TẮT để tránh tự động convert markdown syntax
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown";
import { $isParagraphNode } from "lexical";

import {
  $createCheckBlockNode,
  $isCheckBlockNode,
  CheckBlockNode,
} from "../nodes/check-block-node";
import { EMOJI } from "../transformers/markdown-emoji-transformer";
import { EQUATION } from "../transformers/markdown-equation-transofrmer";
import { HR } from "../transformers/markdown-hr-transformer";
import {
  IMAGE,
  IMAGE_ELEMENT,
} from "../transformers/markdown-image-transformer";
import { TABLE } from "../transformers/markdown-table-transformer";

export const MARKDOWN_TRANSFORMERS: Array<Transformer> = [
  TABLE,
  HR,
  IMAGE,
  IMAGE_ELEMENT,
  EMOJI,
  EQUATION,
  EQUATION,
  // CHECK_LIST removed to avoid conflict with custom [] transformer
  // CHECK_LIST,
  {
    dependencies: [CheckBlockNode],
    export: (node, traverseChildren) => {
      if (!$isCheckBlockNode(node)) {
        return null;
      }
      const isChecked = node.getChecked();
      return `- [${isChecked ? "x" : " "}] ${traverseChildren(node)}`;
    },
    regExp: /^-\s\[(?:\s|x)\]\s/i,
    replace: (parentNode, _children, match) => {
      const matchText = match[0] ?? "";
      const isChecked = matchText.toLowerCase().includes("[x]");
      const node = $createCheckBlockNode(isChecked);
      node.append(...parentNode.getChildren());
      parentNode.replace(node);
    },
    type: "element",
  },
  // ELEMENT_TRANSFORMERS bao gồm transformers cho lists (unordered và ordered)
  // Cần có để Lexical có thể convert list nodes thành markdown đúng format
  ...ELEMENT_TRANSFORMERS,
  // Transformer custom: Convert current list item to checklist when typing "[] "
  {
    dependencies: [CheckBlockNode, ListNode, ListItemNode],
    export: () => null,
    importRegExp: /^\[\]\s/,
    regExp: /^\[\]\s/,
    replace: (textNode) => {
      textNode.setTextContent(textNode.getTextContent().replace(/^\[\]\s/, ""));
      const parent = textNode.getParent();
      if ($isListItemNode(parent)) {
        const list = parent.getParent();
        if ($isListNode(list)) {
          // Identify the index of the current item
          const children = list.getChildren();
          const index = children.indexOf(parent);

          if (index === -1) return;

          const before = children.slice(0, index);
          const after = children.slice(index + 1);

          const checkBlock = $createCheckBlockNode(false);
          checkBlock.append(...parent.getChildren());

          // Insert checkBlock after the list
          list.insertAfter(checkBlock);

          // If there are items before, keep them in the original list
          // (Lexical automatically handles the original list node content if we don't touch strict children list?)
          // Actually, we must reorganize.

          // Strategy:
          // 1. Insert CheckBlock after List.
          // 2. If 'after' items exist, create a new List after CheckBlock and move them there.
          // 3. If 'before' items exist, remove 'parent' and 'after' items from original list.
          //    If no 'before' items, remove original list.

          if (after.length > 0) {
            const newList = $createListNode(list.getListType());
            newList.append(...after);
            checkBlock.insertAfter(newList);
          }

          if (before.length === 0) {
            list.remove();
          } else {
            // Remove parent and subsequent valid nodes from original list
            // (which are now in checklist or new list)
            parent.remove();
            // 'after' nodes were appended to newList, so they are moved automatically (removed from old list check?).
            // Lexical append() removes from old parent.
          }
        }
      } else if ($isParagraphNode(parent)) {
        const checkBlock = $createCheckBlockNode(false);
        checkBlock.append(...parent.getChildren());
        parent.replace(checkBlock);
      }
    },
    trigger: " ",
    type: "text-match",
  },
  // MULTILINE_ELEMENT_TRANSFORMERS - TẮT để tránh tự động convert markdown syntax
  // ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];

import type { EditorState, LexicalEditor, LexicalNode, NodeKey } from "lexical";
import { $isListItemNode } from "@lexical/list";
import { $findMatchingParent } from "@lexical/utils";
import { $getNodeByKey, $isElementNode, $isRootNode } from "lexical";

/** Animation id, so tests (and anything else) can find a running flash. */
export const BLOCK_FLASH_ID = "editor-block-flash";

// Notion's highlight blue, fading out.
const FLASH_KEYFRAMES: Keyframe[] = [
  { backgroundColor: "rgb(35 131 226 / 0.16)" },
  { backgroundColor: "rgb(35 131 226 / 0)" },
];

/**
 * Briefly highlight a block. Web Animations rather than a CSS class: the
 * editor ships no stylesheet of its own (the theme CSS is only imported by the
 * published renderer), and an animation needs no keyframes defined anywhere.
 */
export function flashElement(element: HTMLElement): void {
  for (const animation of element.getAnimations()) {
    if (animation.id === BLOCK_FLASH_ID) animation.cancel();
  }
  const animation = element.animate(FLASH_KEYFRAMES, {
    duration: 1400,
    easing: "ease-out",
  });
  animation.id = BLOCK_FLASH_ID;
}

export function flashNodeKeys(
  editor: LexicalEditor,
  keys: Iterable<NodeKey>,
): void {
  for (const key of keys) {
    const element = editor.getElementByKey(key);
    if (element) flashElement(element);
  }
}

/** The block a node belongs to: its list item, else its top-level element. */
function $blockOf(node: LexicalNode): LexicalNode | null {
  if ($isListItemNode(node)) return node;
  const item = $findMatchingParent(node, $isListItemNode);
  if (item) return item;
  if ($isRootNode(node)) return null;
  return node.getTopLevelElement() ?? null;
}

type Placement = {
  parent: NodeKey | null;
  previous: NodeKey | null;
  next: NodeKey | null;
  text: string;
};

function readPlacements(
  state: EditorState,
  keys: Iterable<NodeKey>,
): Map<NodeKey, Placement> {
  const placements = new Map<NodeKey, Placement>();
  state.read(() => {
    for (const key of keys) {
      const node = $getNodeByKey(key);
      if (!node) continue;
      placements.set(key, {
        parent: node.getParent()?.getKey() ?? null,
        previous: node.getPreviousSibling()?.getKey() ?? null,
        next: node.getNextSibling()?.getKey() ?? null,
        text: $isElementNode(node)
          ? node.getTextContent()
          : node.getTextContent(),
      });
    }
  });
  return placements;
}

/**
 * The blocks an undo or redo visibly changed, for highlighting.
 *
 * History swaps the whole editor state, so there are no dirty-node hints; the
 * two states are compared instead. A block counts when it came back, was moved
 * (new parent, or both neighbours changed — a block beside a moved one has
 * only one), or its text changed. Blocks that merely renumbered or shifted
 * because a neighbour moved are left alone, or undoing one move would light up
 * the whole list.
 */
export function changedBlockKeys(
  previous: EditorState,
  next: EditorState,
): NodeKey[] {
  const candidates = new Set<NodeKey>();
  next.read(() => {
    for (const [key, node] of next._nodeMap) {
      if (previous._nodeMap.get(key) === node) continue;
      const block = $blockOf(node);
      if (block) candidates.add(block.getKey());
    }
  });

  const before = readPlacements(previous, candidates);
  const after = readPlacements(next, candidates);
  const changed: NodeKey[] = [];

  for (const key of candidates) {
    const now = after.get(key);
    const then = before.get(key);
    if (!now) continue;
    const moved =
      !then ||
      then.parent !== now.parent ||
      (then.previous !== now.previous && then.next !== now.next);
    if (moved || then.text !== now.text) changed.push(key);
  }
  return changed;
}

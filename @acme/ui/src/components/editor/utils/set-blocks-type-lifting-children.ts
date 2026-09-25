import type { ListItemNode, ListNode } from "@lexical/list";
import type { BaseSelection, ElementNode, LexicalNode } from "lexical";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent } from "@lexical/utils";
import { $isRangeSelection } from "lexical";

/**
 * The item Lexical keeps a nested list in: one whose only child is a list,
 * placed right after the item it belongs under.
 */
function $nestedListAfter(item: ListItemNode): ListNode | null {
  const next = item.getNextSibling();
  if (!$isListItemNode(next)) return null;
  const children = next.getChildren();
  const [only] = children;
  return children.length === 1 && $isListNode(only) ? only : null;
}

/**
 * `$setBlocksType`, bringing a converted list item's children along the way
 * Notion does.
 *
 * Turning "1. 11" into a heading used to leave the items nested under it —
 * "a. b. c." — nested under nothing, still lettered. They now come up to the
 * top level in its place, and a following list of the same kind joins them,
 * so they number on: "1. 2. 3." and then the rest.
 *
 * Only a conversion does this. The same shape — a nested list with no item
 * above it — is also what indenting the first item of a list makes, and
 * that is left alone, which is why this lives here rather than as a rule on
 * the tree.
 */
export function $setBlocksTypeLiftingChildren(
  selection: BaseSelection | null,
  createElement: () => ElementNode,
): void {
  const children: ListNode[] = [];

  if ($isRangeSelection(selection)) {
    const items = new Set<ListItemNode>();
    for (const node of selection.getNodes()) {
      const item = $findMatchingParent(node, (candidate: LexicalNode) =>
        $isListItemNode(candidate),
      );
      if ($isListItemNode(item)) items.add(item);
    }
    for (const item of items) {
      const nested = $nestedListAfter(item);
      if (nested) children.push(nested);
    }
  }

  $setBlocksType(selection, createElement);

  for (const nested of children) {
    const wrapper = nested.getParent();
    const list = wrapper?.getParent();
    if (!$isListItemNode(wrapper) || !$isListNode(list)) continue;
    // Still right after an item — the conversion kept it a list item — so
    // its children still have a parent, and stay where they are.
    if (!wrapper.is(list.getFirstChild())) continue;

    list.insertBefore(nested);
    wrapper.remove();

    if (list.isEmpty()) {
      list.remove();
    } else if (list.getListType() === nested.getListType()) {
      nested.append(...list.getChildren());
      list.remove();
    }
  }
}

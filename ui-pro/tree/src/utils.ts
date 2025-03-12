import type { UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import type { AnyObject } from "@acme/ui";

import type { FlattenedNode, TreeDataNode } from "./types";

export const iOS =
  navigator.userAgent.includes("iPad") ||
  navigator.userAgent.includes("iPhone") ||
  navigator.userAgent.includes("iPod"); ///iPad|iPhone|iPod/.test(navigator.platform);

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

export function getProjection(
  items: FlattenedNode[],
  activeId: UniqueIdentifier | undefined,
  overId: UniqueIdentifier | undefined,
  dragOffset: number,
  indentationWidth: number,
) {
  const overItemIndex = items.findIndex(({ key }) => key === overId);
  const activeItemIndex = items.findIndex(({ key }) => key === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem ? activeItem.depth + dragDepth : 0;
  const maxDepth = getMaxDepth({
    previousItem,
  });
  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.key;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? undefined;
  }
}

function getMaxDepth({
  previousItem,
}: {
  previousItem: FlattenedNode | undefined;
}) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

function getMinDepth({ nextItem }: { nextItem: FlattenedNode | undefined }) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

function flatten(
  items: TreeDataNode[],
  parentId: UniqueIdentifier | undefined = undefined,
  depth = 0,
): FlattenedNode[] {
  const result: FlattenedNode[] = [];
  for (const [index, item] of items.entries()) {
    result.push({
      ...item,
      parentId,
      depth,
      index,
      // isLast: false,
      // parent: undefined
    });

    if (item.children && item.children.length > 0) {
      result.push(...flatten(item.children, item.key, depth + 1));
    }
  }
  return result;
}

export function flattenTree(items: TreeDataNode[]): FlattenedNode[] {
  return flatten(items);
}

export function buildTree(flattenedItems: FlattenedNode[]): TreeDataNode[] {
  const root: TreeDataNode = { key: "root", title: "", children: [] };
  const nodes: Record<string, TreeDataNode> = { [root.key]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { key, title, children } = item;
    const parentId = item.parentId ?? root.key;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[key] = { key, title, children };
    parent?.children?.push(item);
  }

  return root.children ?? [];
}

export function findItem(items: TreeDataNode[], itemId: UniqueIdentifier) {
  return items.find(({ key }) => key === itemId);
}

export function findItemDeep(
  items: TreeDataNode[],
  itemId: UniqueIdentifier,
): TreeDataNode | undefined {
  for (const item of items) {
    const { key, children } = item;

    if (key === itemId) {
      return item;
    }

    if (children && children.length > 0) {
      const child = findItemDeep(children, itemId);

      if (child) {
        return child;
      }
    }
  }

  return undefined;
}

export function removeItem(items: TreeDataNode[], id: UniqueIdentifier) {
  const newItems = [];

  for (const item of items) {
    if (item.key === id) {
      continue;
    }

    if (item.children && item.children.length > 0) {
      item.children = removeItem(item.children, id);
    }

    newItems.push(item);
  }

  return newItems;
}

export function setProperty<T extends keyof TreeDataNode>(
  items: TreeDataNode[],
  id: UniqueIdentifier,
  property: T,
  setter: (value: TreeDataNode[T]) => TreeDataNode[T],
) {
  for (const item of items) {
    if (item.key === id) {
      item[property] = setter(item[property]);
      continue;
    }

    if (item.children && item.children.length > 0) {
      item.children = setProperty(item.children, id, property, setter);
    }
  }

  return [...items];
}

function countChildren(items: TreeDataNode[], count = 0): number {
  for (const { children } of items) {
    if (children && children.length > 0) {
      return countChildren(children, count + 1);
    }
    count = count + 1;
  }
  return count;
  //  return items.reduce((acc, { children }) => {
  //   if (children.length > 0) {
  //     return countChildren(children, acc + 1);
  //   }
  //
  //   return acc + 1;
  // }, count);
}

export function getChildCount(items: TreeDataNode[], id: UniqueIdentifier) {
  const item = findItemDeep(items, id);

  return item?.children ? countChildren(item.children) : 0;
}

export function removeChildrenOf<T extends AnyObject>(
  items: FlattenedNode<T>[],
  ids: UniqueIdentifier[],
) {
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children?.length) {
        excludeParentIds.push(item.key);
      }
      return false;
    }

    return true;
  });
}

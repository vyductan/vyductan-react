import type {
  Announcements,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  DropAnimation,
  Modifier,
  UniqueIdentifier,
} from "@dnd-kit/core";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMergedState } from "@rc-component/util";
import { createPortal } from "react-dom";

import type { AnyObject } from "@acme/ui";

import type { FlattenedNode, SensorContext, TreeDataNode } from "./types";
import { TreeItem } from "./_components/tree-item";
import { sortableTreeKeyboardCoordinates } from "./keyboard-coordinates";
import {
  buildTree,
  flattenTree,
  getChildCount,
  getProjection,
  removeChildrenOf,
  removeItem,
  // setProperty,
} from "./utils";

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};
const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: "ease-out",
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};
const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};

type TreeProps<TRecord extends AnyObject = AnyObject> = {
  treeData: TreeDataNode<TRecord>[];

  collapsible?: boolean;
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;

  /** Expand all tree nodes by default */
  defaultExpandAll?: boolean;
  /** Expand the corresponding tree node by default */
  defaultExpandParent?: boolean;
  /** Expand the specified tree node by default */
  defaultExpandedKeys?: React.Key[];
  /** (Controlled) Expand the specified tree node */
  expandedKeys?: React.Key[];
  /** Callback function for when a treeNode is expanded or collapsed */
  onExpand?: (
    expandedKeys: React.Key[],
    // info: {
    //   // node: EventDataNode<TreeDataType>;
    //   expanded: boolean;
    //   // nativeEvent: MouseEvent;
    // },
  ) => void;

  /** (Controlled) Tree node with checked checkbox */
  checkedKeys?:
    | React.Key[]
    | { checked: React.Key[]; halfChecked: React.Key[] };
  /** Tree node with checkbox checked by default */
  defaultCheckedKeys?: React.Key[];

  /** (Controlled) Set the selected tree node */
  selectedKeys?: React.Key[];
  /** Tree node selected by default */
  defaultSelectedKeys?: React.Key[];
  selectable?: boolean;
  /** Callback function for when the user clicks a treeNode */
  onSelect?: (
    selectedKeys: React.Key[],
    e: {
      event: "select";
      selected: boolean;
      // node: EventDataNode<TreeDataType>;
      // selectedNodes: TreeDataType[];
      // nativeEvent: MouseEvent;
    },
  ) => void;

  conditionAllowSwapItem?: (
    args: DragEndEvent & {
      activeItem: TreeDataNode<TRecord>;
      overItem: TreeDataNode<TRecord>;
    },
  ) => boolean;
};
const Tree = <TRecord extends AnyObject = AnyObject>({
  collapsible,
  treeData,
  indicator = true,
  indentationWidth = 50,
  removable,
  expandedKeys: expandedKeysProp,
  defaultExpandedKeys,
  onExpand,

  conditionAllowSwapItem,
}: TreeProps<TRecord>) => {
  // =========================== Expanded ===========================
  const [expandedKeys, setExpandedKeys] = useMergedState(
    defaultExpandedKeys ?? [],
    {
      value: expandedKeysProp,
      onChange: (value) => {
        onExpand?.(value);
      },
    },
  );

  const [items, setItems] = useState<TreeDataNode[]>(treeData);

  const [activeId, setActiveId] = useState<UniqueIdentifier>();
  const [overId, setOverId] = useState<UniqueIdentifier>();
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<
    | {
        parentId: UniqueIdentifier | undefined;
        overId: UniqueIdentifier;
      }
    | undefined
  >();

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree
      .filter((item) => !expandedKeys.includes(item.key))
      .map((item) => item.key);
    // const collapsedItems = flattenedTree.reduce<UniqueIdentifier[]>(
    //   (acc, { children, collapsed, id }) =>
    //     collapsed && children?.length ? [...acc, id] : acc,
    //   [],
    // );

    const result = removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems,
    );
    return result;
  }, [activeId, expandedKeys, items]);

  const projected = getProjection(
    flattenedItems,
    activeId,
    overId,
    offsetLeft,
    indentationWidth,
    // keepGhostInPlace ?? false,
    // canRootHaveChildren
  );

  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });
  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth),
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
        // delay: 100,
        // tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    }),
  );

  const sortedIds = useMemo(
    () => flattenedItems.map(({ key }) => key),
    [flattenedItems],
  );
  const activeItem = activeId
    ? flattenedItems.find(({ key }) => key === activeId)
    : undefined;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Picked up ${active.id}.`;
    },
    onDragMove({ active, over }) {
      return getMovementAnnouncement("onDragMove", active.id, over?.id);
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement("onDragOver", active.id, over?.id);
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement("onDragEnd", active.id, over?.id);
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`;
    },
  };
  function getMovementAnnouncement(
    eventName: string,
    activeId: UniqueIdentifier,
    overId?: UniqueIdentifier,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (overId && projected) {
      if (eventName !== "onDragEnd") {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems: FlattenedNode[] = structuredClone(flattenTree(items));
      const overIndex = clonedItems.findIndex(({ key }) => key === overId);
      const activeIndex = clonedItems.findIndex(({ key }) => key === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb = eventName === "onDragEnd" ? "dropped" : "moved";
      const nestedVerb = eventName === "onDragEnd" ? "dropped" : "nested";

      if (previousItem) {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.key}.`;
        } else {
          let previousSibling: FlattenedNode | undefined = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId: UniqueIdentifier | undefined =
              previousSibling.parentId;
            previousSibling = sortedItems.find(({ key }) => key === parentId);
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.key}.`;
          }
        }
      } else {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem?.key}.`;
      }

      return announcement;
    }

    return;
  }

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId);
    setOverId(activeId);

    const activeItem = flattenedItems.find(({ key }) => key === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? undefined);
  }

  function handleDragEnd({ active, over, ...rest }: DragEndEvent) {
    resetState();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: FlattenedNode<TRecord>[] = structuredClone(
        flattenTree(items),
      );
      const activeItem = clonedItems.find(({ key }) => key === over.id)!;
      const overItem = clonedItems.find(({ key }) => key === over.id)!;
      if (
        !conditionAllowSwapItem?.({
          active,
          over,
          ...rest,
          activeItem,
          overItem,
        })
      ) {
        return;
      }

      const overIndex = clonedItems.findIndex(({ key }) => key === over.id);
      const activeIndex = clonedItems.findIndex(({ key }) => key === active.id);
      const activeTreeItem = clonedItems[activeIndex]!;

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setItems(newItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(undefined);
    setActiveId(undefined);
    setOffsetLeft(0);
    setCurrentPosition(undefined);

    document.body.style.setProperty("cursor", "");
  }

  function handleRemove(id: UniqueIdentifier) {
    setItems((items) => removeItem(items, id));
  }

  function handleCollapse(id: UniqueIdentifier) {
    if (expandedKeys.includes(id)) {
      setExpandedKeys(expandedKeys.filter((expandedId) => expandedId !== id));
    } else {
      setExpandedKeys([...expandedKeys, id]);
    }
  }

  return (
    <DndContext
      accessibility={{ announcements }}
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <ul role="tree">
          {flattenedItems.map(({ key, title, children, depth }) => {
            const collapsed = expandedKeys.includes(key);
            return (
              <TreeItem
                key={key}
                id={key}
                title={title}
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                depth={key === activeId && projected ? projected.depth : depth}
                indentationWidth={indentationWidth}
                indicator={indicator}
                collapsed={Boolean(
                  collapsed && children && children.length > 0,
                )}
                onCollapse={
                  collapsible && children && children.length > 0
                    ? () => handleCollapse(key)
                    : undefined
                }
                onRemove={removable ? () => handleRemove(key) : undefined}
              />
            );
          })}

          {createPortal(
            <DragOverlay
              dropAnimation={dropAnimationConfig}
              modifiers={indicator ? [adjustTranslate] : undefined}
            >
              {activeId && activeItem ? (
                <TreeItem
                  key={activeId}
                  id={activeId}
                  title={activeItem.title}
                  depth={activeItem.depth}
                  clone
                  childCount={getChildCount(items, activeId) + 1}
                  indentationWidth={indentationWidth}
                />
              ) : (
                <></>
              )}
            </DragOverlay>,
            document.body,
          )}
          {/* <Card className="space-y-2 p-4"> */}
          {/*   {items.map((item) => ( */}
          {/*     <TreeItem key={item.key} item={item} /> */}
          {/*   ))} */}
          {/* </Card> */}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export { Tree };

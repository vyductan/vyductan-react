import type {
  Active,
  Announcements,
  CollisionDetection,
  DropAnimation,
  KeyboardCoordinateGetter,
  MeasuringConfiguration,
  Modifiers,
  PointerActivationConstraint,
  ScreenReaderInstructions,
  UniqueIdentifier,
} from "@dnd-kit/core";
import type {
  AnimateLayoutChanges,
  NewIndexGetter,
  SortingStrategy,
} from "@dnd-kit/sortable";
import React, { useEffect, useRef, useState } from "react";
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { useMergedState } from "rc-util";
import { createPortal } from "react-dom";

import type { ItemProps } from "./_components/item";
import { Item } from "./_components/item";
import { List } from "./_components/list";

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable: `
    To pick up a sortable item, press the space bar.
    While sorting, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};

type SortableItemDef = { id: UniqueIdentifier; children?: React.ReactNode };

export interface SortableProps {
  classNames?: {
    item?: string;
    list?: string;
    wrapper?: string;
    handle?: string;
    handleWrapper?: string;
  };
  activationConstraint?: PointerActivationConstraint;
  animateLayoutChanges?: AnimateLayoutChanges;
  adjustScale?: boolean;
  collisionDetection?: CollisionDetection;
  coordinateGetter?: KeyboardCoordinateGetter;
  Container?: any; // To-do: Fix me
  dropAnimation?: DropAnimation | null;
  getNewIndex?: NewIndexGetter;
  handle?: boolean;
  // itemCount?: number;
  items?: SortableItemDef[];
  renderItem?: ItemProps["renderItem"];
  onDragEnd?: (activeIndex: number, overIndex: number) => void;

  measuring?: MeasuringConfiguration;
  modifiers?: Modifiers;
  removable?: boolean;
  reorderItems?: typeof arrayMove;
  strategy?: SortingStrategy;
  useDragOverlay?: boolean;
  getItemStyles?(args: {
    id: UniqueIdentifier;
    index: number;
    isSorting: boolean;
    isDragOverlay: boolean;
    overIndex: number;
    isDragging: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {
    active: Pick<Active, "id"> | null;
    index: number;
    isDragging: boolean;
    id: UniqueIdentifier;
  }): React.CSSProperties;
  isDisabled?(id: UniqueIdentifier): boolean;
}

export const Sortable = ({
  classNames,
  activationConstraint,
  animateLayoutChanges,
  adjustScale = false,
  Container = List,
  collisionDetection = closestCenter,
  coordinateGetter = sortableKeyboardCoordinates,
  dropAnimation = dropAnimationConfig,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  getItemStyles = () => ({}),
  getNewIndex,
  handle = false,
  // itemCount = 16,
  items: initialItems,
  onDragEnd,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  isDisabled = () => false,
  measuring,
  modifiers,
  removable,
  renderItem,
  reorderItems = arrayMove,
  strategy = rectSortingStrategy,
  useDragOverlay = true,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  wrapperStyle = () => ({}),
}: SortableProps) => {
  const [items, setItems] = useMergedState<SortableItemDef[]>(
    initialItems ?? [],
    {
      value: initialItems ?? [],
      // onChange(value) {
      // },
    },
  );
  // const [items, setItems] = useState<SortableItemDef[]>(initialItems ?? []);
  // const [items, setItems] = useState<UniqueIdentifier[]>(
  //   (initialItems ?? []).map((x) => x.id),
  // );
  // const [activeId, setActiveId] = useState<UniqueIdentifier>();

  const [activeItem, setActiveItem] = useState<SortableItemDef>();
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint,
    }),
    useSensor(KeyboardSensor, {
      // Disable smooth scrolling in Cypress automated tests
      scrollBehavior: "Cypress" in globalThis ? "auto" : undefined,
      coordinateGetter,
    }),
  );
  const isFirstAnnouncement = useRef(true);
  // const getIndex = (id: UniqueIdentifier) => items.indexOf(id);
  const getIndex = (id: UniqueIdentifier) =>
    items.findIndex((x) => x.id === id);
  const getPosition = (id: UniqueIdentifier) => getIndex(id) + 1;
  const activeIndex = activeItem?.id ? getIndex(activeItem.id) : -1;
  const handleRemove = removable
    ? (id: UniqueIdentifier) =>
        setItems((items) => items.filter((item) => item.id !== id))
    : undefined;
  const announcements: Announcements = {
    onDragStart({ active: { id } }) {
      return `Picked up sortable item ${String(
        id,
      )}. Sortable item ${id} is in position ${getPosition(id)} of ${
        items.length
      }`;
    },
    onDragOver({ active, over }) {
      // In this specific use-case, the picked up item's `id` is always the same as the first `over` id.
      // The first `onDragOver` event therefore doesn't need to be announced, because it is called
      // immediately after the `onDragStart` announcement and is redundant.
      if (isFirstAnnouncement.current === true) {
        isFirstAnnouncement.current = false;
        return;
      }

      if (over) {
        return `Sortable item ${
          active.id
        } was moved into position ${getPosition(over.id)} of ${items.length}`;
      }

      return;
    },
    onDragEnd({ active, over }) {
      if (over) {
        return `Sortable item ${
          active.id
        } was dropped at position ${getPosition(over.id)} of ${items.length}`;
      }

      return;
    },
    onDragCancel({ active: { id } }) {
      return `Sorting was cancelled. Sortable item ${id} was dropped and returned to position ${getPosition(
        id,
      )} of ${items.length}.`;
    },
  };

  useEffect(() => {
    if (!activeItem) {
      isFirstAnnouncement.current = true;
    }
  }, [activeItem]);

  return (
    <DndContext
      accessibility={{
        announcements,
        screenReaderInstructions,
      }}
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={({ active }) => {
        // if (!active) {
        //   return;
        // }

        setActiveItem(items.find((x) => x.id === active.id));
      }}
      onDragEnd={({ over }) => {
        setActiveItem(undefined);

        if (over) {
          const overIndex = getIndex(over.id);
          if (activeIndex !== overIndex) {
            setItems((items) => reorderItems(items, activeIndex, overIndex));
            onDragEnd?.(activeIndex, overIndex);
          }
        }
      }}
      onDragCancel={() => setActiveItem(undefined)}
      measuring={measuring}
      modifiers={modifiers}
    >
      <SortableContext items={items} strategy={strategy}>
        <Container className={classNames?.list}>
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              handle={handle}
              index={index}
              style={getItemStyles}
              className={classNames?.item}
              wrapperStyle={wrapperStyle}
              disabled={isDisabled(item.id)}
              renderItem={renderItem}
              onRemove={handleRemove}
              animateLayoutChanges={animateLayoutChanges}
              useDragOverlay={useDragOverlay}
              getNewIndex={getNewIndex}
            >
              {item.children}
            </SortableItem>
          ))}
        </Container>
      </SortableContext>

      {useDragOverlay
        ? createPortal(
            <DragOverlay
              adjustScale={adjustScale}
              dropAnimation={dropAnimation}
            >
              {activeItem ? (
                <Item
                  id={activeItem.id}
                  index={0}
                  className={classNames?.item}
                  // value={items[activeIndex]?.id}
                  handle={handle}
                  renderItem={renderItem}
                  wrapperStyle={wrapperStyle({
                    active: { id: activeItem.id },
                    index: activeIndex,
                    isDragging: true,
                    id: items[activeIndex]!.id,
                  })}
                  style={getItemStyles({
                    id: items[activeIndex]!.id,
                    index: activeIndex,
                    isSorting: !!activeItem,
                    isDragging: true,
                    overIndex: -1,
                    isDragOverlay: true,
                  })}
                  adjustScale={adjustScale}
                  dragOverlay
                >
                  {activeItem.children}
                </Item>
              ) : undefined}
            </DragOverlay>,
            document.body,
          )
        : undefined}
    </DndContext>
  );
};

interface SortableItemProps
  extends Omit<ItemProps, "style" | "wrapperStyle" | "onRemove"> {
  id: UniqueIdentifier;
  children: React.ReactNode;

  animateLayoutChanges?: AnimateLayoutChanges;
  disabled?: boolean;
  getNewIndex?: NewIndexGetter;
  index: number;
  handle: boolean;
  useDragOverlay?: boolean;
  onRemove?(id: UniqueIdentifier): void;
  style(values: any): React.CSSProperties;
  renderItem?(args: any): React.ReactElement<any>;
  wrapperStyle: SortableProps["wrapperStyle"];
}

export const SortableItem = ({
  id,
  children,

  disabled,
  animateLayoutChanges,
  getNewIndex,
  handle,
  index,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  onRemove,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  style,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  renderItem,
  useDragOverlay,
  wrapperStyle,
  ...itemProps
}: SortableItemProps) => {
  const {
    active,
    attributes,
    isDragging,
    isSorting,
    listeners,
    overIndex,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
    disabled,
    getNewIndex,
  });

  return (
    <Item
      id={id}
      ref={setNodeRef}
      // value={id}
      disabled={disabled}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={
        handle
          ? {
              ref: setActivatorNodeRef,
            }
          : undefined
      }
      renderItem={renderItem}
      index={index}
      style={style({
        index,
        id,
        isDragging,
        isSorting,
        overIndex,
      })}
      onRemove={onRemove ? () => onRemove(id) : undefined}
      transform={transform}
      transition={transition}
      wrapperStyle={wrapperStyle?.({ index, isDragging, active, id })}
      listeners={listeners}
      data-index={index}
      data-id={id}
      dragOverlay={!useDragOverlay && isDragging}
      attributes={attributes}
      {...itemProps}
    >
      {children}
    </Item>
  );
};

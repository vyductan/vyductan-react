import type {
  Announcements,
  CollisionDetection,
  DragStartEvent,
  KeyboardCoordinateGetter,
  MeasuringConfiguration,
  Modifiers,
  PointerActivationConstraint,
  ScreenReaderInstructions,
  UniqueIdentifier,
} from "@dnd-kit/core";
import type { SortingStrategy } from "@dnd-kit/sortable";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext as DndSortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useMergedState } from "rc-util";

import type { SortableItemDef } from "./types";

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable: `
    To pick up a sortable item, press the space bar.
    While sorting, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};

type SortableContextProps = {
  items: SortableItemDef[];
  children: React.ReactNode;

  /* events */
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (activeIndex: number, overIndex: number) => void;
  /* configs */
  activationConstraint?: PointerActivationConstraint;
  collisionDetection?: CollisionDetection;
  coordinateGetter?: KeyboardCoordinateGetter;
  measuring?: MeasuringConfiguration;
  modifiers?: Modifiers;
  strategy?: SortingStrategy;

  reorderItems?: typeof arrayMove;
  /* dragoverlay */
  dragoverlay?: {
    comp?: ReactNode;
  };
};

const SortableContext = ({
  items: itemsProp,
  children,

  onDragStart,
  onDragEnd,

  activationConstraint,
  collisionDetection = closestCenter,
  coordinateGetter = sortableKeyboardCoordinates,
  measuring,
  modifiers,
  strategy,

  reorderItems = arrayMove,
}: SortableContextProps) => {
  const [items, setItems] = useMergedState<SortableItemDef[]>(itemsProp, {
    value: itemsProp,
    // onChange(value) {
    // },
  });
  const [activeItem, setActiveItem] = useState<SortableItemDef>();

  const isFirstAnnouncement = useRef(true);

  const getIndex = (id: UniqueIdentifier) =>
    items.findIndex((x) => x.id === id);
  const getPosition = (id: UniqueIdentifier) => getIndex(id) + 1;
  const activeIndex = activeItem?.id ? getIndex(activeItem.id) : -1;

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

  return (
    <DndContext
      accessibility={{
        announcements,
        screenReaderInstructions,
      }}
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={(event) => {
        // if (!event.active === false) {
        //   return;
        // }

        setActiveItem(items.find((x) => x.id === event.active.id));
        onDragStart?.(event);
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
      <DndSortableContext items={items} strategy={strategy}>
        <button onClick={() => setItems([])}>x</button>
        {children}
      </DndSortableContext>
    </DndContext>
  );
};

export type { SortableContextProps };
export { SortableContext };

import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Card } from "@acme/ui/card";

import type { TreeDataNode } from "./types";
import { TreeItem } from "./_components/tree-item";

const initialItems: TreeDataNode[] = [
  { key: "1", title: "Item 1", children: [] },
  {
    key: "2",
    title: "Item 2",
    children: [
      { key: "2-1", title: "Item 2-1", children: [] },
      { key: "2-2", title: "Item 2-2", children: [] },
    ],
  },
];

function Tree() {
  const [items, setItems] = useState<TreeDataNode[]>(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

    const findItemById = (id: string, nodes: TreeDataNode[]): TreeDataNode | undefined => {
    for (const node of nodes) {
      if (node.key === id) return node;
      if (node.children) {
        const found = findItemById(id, node.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

  setItems((prevItems) => {
      const activeItem = findItemById(active.id as string, prevItems);
      if (!activeItem) return prevItems;
      
      return prevItems.map((item) => {
        if (item.key === over.id) {
          return { ...item, children: [...(item.children ?? []), activeItem] };
        }
        return item;
      });
    });
    // setItems((prevItems) => {
    //   const oldIndex = prevItems.findIndex((item) => item.key === active.id);
    //   const newIndex = prevItems.findIndex((item) => item.key === over.id);
    //   return arrayMove(prevItems, oldIndex, newIndex);
    // });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.key) as UniqueIdentifier[]}
        strategy={verticalListSortingStrategy}
      >
        <Card className="space-y-2 p-4">
          {items.map((item) => (
            <TreeItem key={item.key} item={item} />
          ))}
        </Card>
      </SortableContext>
    </DndContext>
  );
}

export { Tree };

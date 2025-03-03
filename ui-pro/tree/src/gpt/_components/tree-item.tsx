// TreeItem.tsx
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Card } from "@acme/ui/card";

import { TreeDataNode } from "../types";

interface TreeItemProps {
  item: TreeDataNode;
}

export function TreeItem({ item }: TreeItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.key as UniqueIdentifier });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2"
    >
      {item.title}
      {item.children && item.children.length > 0 && (
        <div className="ml-4">
          {item.children.map((child) => (
            <TreeItem key={child.key} item={child} />
          ))}
        </div>
      )}
    </Card>
  );
}

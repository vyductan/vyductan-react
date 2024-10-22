import type { UniqueIdentifier } from "@dnd-kit/core";

export type SortableItemDef = {
  id: UniqueIdentifier;
  children?: React.ReactNode;
};

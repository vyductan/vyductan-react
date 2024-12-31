import type { DndContextProps } from "@dnd-kit/core";
import { DndContext } from "@dnd-kit/core";

type DragAndDropProps = DndContextProps;
export const DragAndDrop = ({ ...props }: DragAndDropProps) => {
  return <DndContext {...props} />;
};

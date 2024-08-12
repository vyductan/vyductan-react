import type { DragEvent as ReactDragEvent } from "react";
import { memo, useCallback } from "react";

import { clsm } from "@acme/ui";

import { useDraggableStore } from "../../stores/useDraggableStore";

const DraggableElement = () => {
  const { draggable, resetState } = useDraggableStore();

  const handleOnDragStart = useCallback(
    ({ dataTransfer }: ReactDragEvent<HTMLDivElement>) => {
      if (!draggable?.htmlElement) {
        return;
      }
      // THIS WILL SET THE DRAGGABLE IMAGE
      dataTransfer.setDragImage(draggable.htmlElement, 0, 0);
    },
    [draggable?.htmlElement],
  );

  if (!draggable?.data) {
    return null;
  }

  const scrollOffset = document.body.getBoundingClientRect().top;

  return (
    <div
      style={{
        top: draggable.data.top - scrollOffset,
        left: draggable.data.left - 23,
        height: draggable.data.height,
      }}
      className={clsm(
        "absolute h-10 w-4 cursor-grab bg-red-500 transition-[background]",
        "active:cursor-grabbing",
        "hover:bg-blue-600",
      )}
      onDragStart={handleOnDragStart}
      onDragEnd={resetState}
    />
  );
};

const Memoized = memo(DraggableElement, () => true);

export { Memoized as DraggableElement };

import React from "react";

import { useDraggableLineStore } from "../../stores/useDraggableStore";

const DraggableLine: React.FC = () => {
  const { line } = useDraggableLineStore();

  if (!line?.data) {
    return null;
  }

  const scrollOffset = document.body.getBoundingClientRect().top;

  return (
    <div
      className="pointer-events-none absolute z-[20000] h-1 w-full bg-blue-300"
      style={{
        top: line.data.top + line.data.height - scrollOffset,
        left: line.data.left,
        width: line.data.width,
      }}
    />
  );
};

const Memoized = React.memo(DraggableLine, () => true);

export { Memoized as DraggableLine };

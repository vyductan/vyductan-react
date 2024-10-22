import type { DetailedHTMLProps, HTMLAttributes } from "react";
import { useDroppable } from "@dnd-kit/core";

type DroppableProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  id: string;
};
export function Droppable(props: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...props}>
      {props.children}
    </div>
  );
}

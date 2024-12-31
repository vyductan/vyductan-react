import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import React, { useContext, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { TableRow } from ".";
import { Button } from "../../button";
import { Icon } from "../../icons";

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

const RowContext = React.createContext<RowContextProps>({});
const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      variant="ghost"
      icon={<Icon icon="icon-[octicon--grabber-16]" />}
      {...listeners}
      ref={setActivatorNodeRef}
    />
  );
};

interface TableRowSortableProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}
const TableRowSortable: React.FC<TableRowSortableProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props["data-row-key"] });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <TableRow {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

export { TableRowSortable, DragHandle };

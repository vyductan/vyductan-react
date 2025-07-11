import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import React, { useContext, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { ButtonProps } from "@acme/ui/components/button";
import { Button } from "@acme/ui/components/button";
import { Icon } from "@acme/ui/icons";

import { TableRow } from ".";

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

const RowContext = React.createContext<RowContextProps>({});
type DragHandleProps = ButtonProps & {
  readOnly?: boolean;
};
const DragHandle = ({ readOnly, ...props }: DragHandleProps) => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      variant="ghost"
      size="small"
      icon={<Icon icon="icon-[octicon--grabber-16]" />}
      {...(readOnly ? {} : listeners)}
      ref={readOnly ? undefined : setActivatorNodeRef}
      {...props}
    />
  );
};

interface TableRowSortableProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
  asHandle?: boolean;
}
const TableSortableRow: React.FC<TableRowSortableProps> = ({
  asHandle = true,
  ...props
}) => {
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
    ...(asHandle ? { cursor: "move" } : { cursor: "auto" }),
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <TableRow
        {...props}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...(asHandle ? listeners : {})}
      />
    </RowContext.Provider>
  );
};

export { TableSortableRow as TableRowSortable, DragHandle };

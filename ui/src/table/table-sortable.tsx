"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { ForwardedRef } from "react";
import React, { forwardRef, useContext, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import _ from "lodash";

import type { SortableContextProps } from "../drag-and-drop";
import type { TableProps } from "./table";
import type { TableColumnDef } from "./types";
import { Button } from "../button";
import { SortableContext } from "../drag-and-drop";
import { Icon } from "../icons";
import { TableRow } from "./_components";
import { Table } from "./table";

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

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

const Row: React.FC<RowProps> = (props) => {
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

type TableSortableProps<TRecord extends Record<string, unknown>> =
  TableProps<TRecord> & {
    dnd?: Pick<SortableContextProps, "onDragEnd">;
  };
const TableSortableInternal = <TRecord extends Record<string, unknown>>(
  {
    columns: columnsProp = [],
    dataSource = [],
    rowKey = "id",

    /* Dnd */
    dnd,
    // collisionDetection = closestCenter,

    ...props
  }: TableSortableProps<TRecord>,
  ref: ForwardedRef<HTMLTableElement>,
) => {
  console.log("table");
  const columns: TableColumnDef<TRecord>[] = useMemo(
    () => [
      { key: "sort", align: "center", width: 80, render: () => <DragHandle /> },
      ...columnsProp,
    ],
    [columnsProp],
  );
  return (
    <>
      <SortableContext
        items={dataSource.map((record) => {
          return { id: record[rowKey] as UniqueIdentifier };
        })}
        {...dnd}
      >
        <Table
          ref={ref}
          columns={columns}
          dataSource={dataSource}
          components={{ body: { row: Row } }}
          {...props}
        />
      </SortableContext>
    </>
  );
};

const TableSortable = forwardRef(TableSortableInternal) as <
  T extends Record<string, unknown>,
>(
  props: TableSortableProps<T> & { ref?: ForwardedRef<HTMLTableElement> },
) => ReturnType<typeof TableSortableInternal>;

export type { TableSortableProps };
export { TableSortable };

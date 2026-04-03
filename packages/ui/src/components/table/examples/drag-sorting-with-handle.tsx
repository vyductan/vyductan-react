"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import type { Modifier } from "@dnd-kit/core/dist/modifiers";
import type React from "react";
import { useState } from "react";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { TableProps } from "@acme/ui/components/table";
import {
  DragHandle,
  Table,
  TableRowSortable,
} from "@acme/ui/components/table";
import { Space } from "@acme/ui/components/space";
import { Tag } from "@acme/ui/components/tag";

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const initialData: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    tags: ["nice", "developer"],
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address:
      "Kucukayasofya Mah. Donus SOKAK Uyar Apt. No:3 34000 Istanbul,Turkey",
    tags: ["loser"],
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
];

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

const columns: TableProps<DataType>["columns"] = [
  {
    key: "sort",
    width: 48,
    align: "center",
    render: () => <DragHandle aria-label="Reorder row" />,
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Age",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Tags",
    key: "tags",
    dataIndex: "tags",
    render: (_, { tags }) => (
      <div className="flex items-center gap-2">
        {tags.map((tag) => {
          let color = tag.length > 5 ? "indigo" : "green";
          if (tag === "loser") {
            color = "orange";
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </div>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const App: React.FC = () => {
  const [dataSource, setDataSource] = useState(initialData);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    setDataSource((currentData) => {
      const activeIndex = currentData.findIndex(
        (item) => item.key === active.id,
      );
      const overIndex = currentData.findIndex((item) => item.key === over.id);

      if (activeIndex === -1 || overIndex === -1) {
        return currentData;
      }

      return arrayMove(currentData, activeIndex, overIndex);
    });
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={dataSource.map((item) => item.key)}
        strategy={verticalListSortingStrategy}
      >
        <Table<DataType>
          columns={columns}
          components={{
            body: {
              row: (props) => <TableRowSortable {...props} asHandle={false} />,
            },
          }}
          dataSource={dataSource}
          rowKey="key"
        />
      </SortableContext>
    </DndContext>
  );
};

export default App;

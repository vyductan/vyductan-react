/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, waitFor } from "storybook/test";

import DragSortingFullRowDemo from "./examples/drag-sorting-full-row";
import DragSortingWithHandleDemo from "./examples/drag-sorting-with-handle";
import { OwnTable as Table } from "./table";
import type { ColumnsType } from "./types";

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns: ColumnsType<DataType> = [
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
      <>
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-accent text-accent-foreground mr-1 rounded px-1 py-0.5 text-xs"
          >
            {tag.toUpperCase()}
          </span>
        ))}
      </>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <div className="flex gap-2">
        <a className="text-primary hover:underline">Invite {record.name}</a>
        <a className="text-destructive hover:underline">Delete</a>
      </div>
    ),
  },
];

const data: DataType[] = [
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
    address: "London No. 1 Lake Park",
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

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    globalThis.requestAnimationFrame(() => resolve());
  });
}

const meta = {
  title: "Components/Table",
  component: Table,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    bordered: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
    size: {
      control: "radio",
      options: ["small", "middle", "large"],
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    columns: columns as any,
    dataSource: data,
  },
};

export const Selection: Story = {
  render: (args: any) => {
    return (
      <Table
        {...args}
        rowSelection={{
          onChange: fn(),
        }}
      />
    );
  },
  args: {
    columns: columns as any,
    dataSource: data,
  },
};

export const Pagination: Story = {
  args: {
    columns: columns as any,
    dataSource: Array.from({ length: 46 }).map((_, i) => ({
      key: i.toString(),
      name: `Edward King ${i}`,
      age: 32,
      address: `London, Park Lane no. ${i}`,
      tags: ["nice", "developer"],
    })),
    pagination: {
      pageSize: 10,
    },
  },
};

export const Loading: Story = {
  args: {
    columns: columns as any,
    dataSource: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    columns: columns as any,
    dataSource: [],
  },
};

export const DragSortingWithHandle: Story = {
  render: () => <DragSortingWithHandleDemo />,
};

export const DragSortingFullRow: Story = {
  render: () => <DragSortingFullRowDemo />,
  play: async ({ canvasElement, step }) => {
    await step(
      "Dragging a row near the bottom edge does not trigger endless wrapper auto-scroll",
      async () => {
        const container = canvasElement.querySelector('[data-slot="table-container"]');
        const wrapper = canvasElement.querySelector('[data-slot="table-scroll-container"]');
        const row = container?.querySelector('tbody tr[data-row-key="1"]');

        await expect(container).toBeTruthy();
        await expect(wrapper).toBeTruthy();
        await expect(row).toBeTruthy();

        if (!(container instanceof HTMLElement)) {
          throw new TypeError("Expected table container element");
        }
        if (!(wrapper instanceof HTMLElement)) {
          throw new TypeError("Expected table scroll wrapper element");
        }
        if (!(row instanceof HTMLElement)) {
          throw new TypeError("Expected sortable row element");
        }

        const initialContainerScrollTop = container.scrollTop;
        const initialWrapperScrollTop = wrapper.scrollTop;
        const initialTransform = getComputedStyle(row).transform;
        const rowRect = row.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        const pointerX = rowRect.left + rowRect.width / 2;
        const pointerStartY = rowRect.top + rowRect.height / 2;
        const pointerActivateY = pointerStartY + 12;
        const pointerEndY = wrapperRect.bottom - 4;
        const pointerEventBase = {
          button: 0,
          buttons: 1,
          clientX: pointerX,
          isPrimary: true,
          pointerId: 1,
          pointerType: "mouse",
        };

        fireEvent.pointerDown(row, {
          ...pointerEventBase,
          clientY: pointerStartY,
        });

        try {
          fireEvent.pointerMove(globalThis.document, {
            ...pointerEventBase,
            clientY: pointerActivateY,
          });

          fireEvent.pointerMove(globalThis.document, {
            ...pointerEventBase,
            clientY: pointerEndY,
          });

          await waitFor(() => {
            expect(getComputedStyle(row).transform).not.toBe(initialTransform);
          });

          const containerScrollTopSamples: number[] = [];
          const wrapperScrollTopSamples: number[] = [];

          for (let index = 0; index < 24; index += 1) {
            await nextAnimationFrame();
            containerScrollTopSamples.push(container.scrollTop);
            wrapperScrollTopSamples.push(wrapper.scrollTop);
          }

          expect(containerScrollTopSamples).toEqual(
            Array.from({ length: containerScrollTopSamples.length }, () => initialContainerScrollTop),
          );
          expect(wrapperScrollTopSamples).toEqual(
            Array.from({ length: wrapperScrollTopSamples.length }, () => initialWrapperScrollTop),
          );
        } finally {
          fireEvent.pointerUp(globalThis.document, {
            ...pointerEventBase,
            buttons: 0,
            clientY: pointerEndY,
          });
        }
      },
    );
  },
};

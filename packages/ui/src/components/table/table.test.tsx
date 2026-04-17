import React from "react";

import "@testing-library/jest-dom/vitest";

import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import type { ColumnsType } from "./types";
import * as localeModule from "../locale";
import useSelection from "./hooks/use-selection";
import * as tableModule from "./index";
import { Table } from "./index";
import { tableLocale_en } from "./locale/en-us";

globalThis.React = React;

globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => void 0,
  removeEventListener: () => void 0,
  addListener: () => void 0,
  removeListener: () => void 0,
  dispatchEvent: () => false,
})) as typeof globalThis.matchMedia;

type SelectionHarnessRecord = {
  key: string;
  name: string;
};

type NumericSelectionHarnessRecord = {
  id: number;
  name: string;
};

type ControlledStringSelectionHarnessRecord = {
  key: string;
  name: string;
};

const columns: ColumnsType<SelectionHarnessRecord> = [
  {
    key: "name",
    dataIndex: "name",
    title: "Name",
  },
];

const data: SelectionHarnessRecord[] = [
  {
    key: "1",
    name: "John Brown",
  },
];

const numericData: NumericSelectionHarnessRecord[] = [
  {
    id: 1,
    name: "John Brown",
  },
];

const controlledStringData: ControlledStringSelectionHarnessRecord[] = [
  {
    key: "1",
    name: "John Brown",
  },
];

const tableExamplesDir = path.resolve(import.meta.dirname, "./examples");

function ControlledStringSelectionHarness({
  initialSelectedRowKeys = ["1"],
  onChange,
}: {
  initialSelectedRowKeys?: React.Key[];
  onChange?: (nextSelectedRowKeys: React.Key[]) => void;
}) {
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>(
    initialSelectedRowKeys,
  );

  return (
    <Table<ControlledStringSelectionHarnessRecord>
      columns={[
        {
          key: "name",
          dataIndex: "name",
          title: "Name",
        },
      ]}
      dataSource={controlledStringData}
      rowSelection={{
        selectedRowKeys,
        onChange: (nextSelectedRowKeys) => {
          setSelectedRowKeys(nextSelectedRowKeys);
          onChange?.(nextSelectedRowKeys);
        },
      }}
    />
  );
}
const tableDocsPath = path.resolve(import.meta.dirname, "./table.mdx");
const tableSourcePath = path.resolve(import.meta.dirname, "./table.tsx");

function ControlledNumericSelectionHarness({
  initialSelectedRowKeys = [1],
  onChange,
}: {
  initialSelectedRowKeys?: React.Key[];
  onChange?: (nextSelectedRowKeys: React.Key[]) => void;
}) {
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>(
    initialSelectedRowKeys,
  );

  return (
    <Table<NumericSelectionHarnessRecord>
      rowKey="id"
      columns={[
        {
          key: "name",
          dataIndex: "name",
          title: "Name",
        },
      ]}
      dataSource={numericData}
      rowSelection={{
        selectedRowKeys,
        onChange: (nextSelectedRowKeys) => {
          setSelectedRowKeys(nextSelectedRowKeys);
          onChange?.(nextSelectedRowKeys);
        },
      }}
    />
  );
}

function SelectionDropdownHarness({
  getPopupContainer,
  onSelect,
}: {
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  onSelect: () => void;
}) {
  const transformColumns = useSelection<SelectionHarnessRecord>(
    {
      childrenColumnName: "children",
      data,
      expandType: null,
      getPopupContainer,
      getRecordByKey: (key) => {
        const record = data.find((candidate) => candidate.key === key);

        if (!record) {
          throw new Error(`Missing record for key: ${String(key)}`);
        }

        return record;
      },
      getRowKey: (record) => record.key,
      locale: tableLocale_en.Table,
      pageData: data,
    },
    {
      selections: [
        {
          key: "custom",
          text: "Run action",
          onSelect,
        },
      ],
    },
  )[2];

  const transformedColumns = transformColumns(columns);
  const title = transformedColumns[0]?.title;

  return typeof title === "function" ? (
    <>{title({ table: {} as never })}</>
  ) : (
    <>{title}</>
  );
}

describe("Table", () => {
  test("re-exports useful table subcomponents", () => {
    expect(tableModule).toHaveProperty("TableToolbarRoot");
    expect(tableModule).toHaveProperty("TableToolbarLeft");
    expect(tableModule).toHaveProperty("TableToolbarRight");
    expect(tableModule).toHaveProperty("TableViewOptions");
    expect(tableModule).toHaveProperty("TableSummary");
    expect(tableModule).toHaveProperty("TableSummaryRow");
    expect(tableModule).toHaveProperty("TableSummaryCell");
    expect(tableModule).toHaveProperty("TableRowSortable");
    expect(tableModule).toHaveProperty("DragHandle");
  });

  test("drag sorting examples import table subcomponents from the public table module", () => {
    const dragSortingFullRow = readFileSync(
      path.join(tableExamplesDir, "drag-sorting-full-row.tsx"),
      "utf8",
    );
    const dragSortingWithHandle = readFileSync(
      path.join(tableExamplesDir, "drag-sorting-with-handle.tsx"),
      "utf8",
    );

    expect(dragSortingFullRow).toContain('from "@acme/ui/components/table"');
    expect(dragSortingWithHandle).toContain('from "@acme/ui/components/table"');
    expect(dragSortingFullRow).not.toContain(
      'from "../_components/table-sortable-row"',
    );
    expect(dragSortingWithHandle).not.toContain(
      'from "../_components/table-sortable-row"',
    );
  });

  test("table docs show public API imports for table subcomponents", () => {
    const tableDocs = readFileSync(tableDocsPath, "utf8");

    expect(tableDocs).toContain('from "@acme/ui/components/table"');
    expect(tableDocs).toContain("TableViewOptions");
    expect(tableDocs).toContain("TableSummary");
    expect(tableDocs).toContain("TableRowSortable");
    expect(tableDocs).toContain("DragHandle");
  });

  test("re-exports locale hook", () => {
    expect(localeModule).toHaveProperty("useLocale");
  });

  test("table source uses the public skeleton component import", () => {
    const tableSource = readFileSync(tableSourcePath, "utf8");

    expect(tableSource).toContain('from "../skeleton"');
    expect(tableSource).not.toContain('from "../../shadcn/skeleton"');
  });

  test("table source uses the public Checkbox component for row selection", () => {
    const tableSource = readFileSync(tableSourcePath, "utf8");

    expect(tableSource).toContain('from "../checkbox"');
    expect(tableSource).toContain("<Checkbox");
  });

  test("keeps the header selection checkbox inside a stable centering wrapper", () => {
    const { container } = render(
      <Table
        columns={columns}
        dataSource={data}
        rowSelection={{
          onChange: vi.fn(),
        }}
      />,
    );

    const headerCheckbox = within(container).getByRole("checkbox", {
      name: "Select all",
    });
    const wrapper = headerCheckbox.parentElement;

    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass("flex", "items-center", "justify-center");
  });

  test("uses a single table scroll container for own table mode", () => {
    const { container } = render(
      <Table
        columns={[
          {
            title: "Name",
            dataIndex: "name",
            key: "name",
          },
        ]}
        dataSource={[
          {
            key: "1",
            name: "John Brown",
          },
        ]}
        scroll={{ x: 600 }}
      />,
    );

    expect(within(container).getByText("John Brown")).not.toBeNull();
    expect(
      container.querySelectorAll('[data-slot="table-scroll-container"]'),
    ).toHaveLength(1);
  });

  test("selection actions portal into the requested popup container", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const popupContainer = document.createElement("div");
    popupContainer.dataset.testid = "popup-root";
    document.body.append(popupContainer);

    render(
      <SelectionDropdownHarness
        getPopupContainer={() => popupContainer}
        onSelect={handleSelect}
      />,
    );

    const trigger = document.querySelector<HTMLButtonElement>(
      'button[aria-haspopup="menu"]',
    );

    expect(trigger).not.toBeNull();

    if (!trigger) {
      throw new Error("Missing selection dropdown trigger");
    }

    await user.click(trigger);

    const portaledMenuItem = within(popupContainer).getByRole("menuitem", {
      name: "Run action",
    });

    expect(portaledMenuItem).not.toBeNull();
    await user.click(portaledMenuItem);

    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalledTimes(1);
    });
  });

  test("renders a row selection checkbox without hanging", () => {
    const { container } = render(
      <Table
        columns={columns}
        dataSource={data}
        rowSelection={{
          onChange: vi.fn(),
        }}
      />,
    );

    expect(
      within(container).getByRole("checkbox", {
        name: "Select row",
      }),
    ).not.toBeNull();
  });

  test("checks a row checkbox and reports the selected key", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const { container } = render(
      <Table
        columns={columns}
        dataSource={data}
        rowSelection={{
          onChange: handleChange,
        }}
      />,
    );

    const rowCheckbox = within(container).getByRole("checkbox", {
      name: "Select row",
    });
    const nativeClick = vi.fn();

    rowCheckbox.addEventListener("click", nativeClick);

    expect(rowCheckbox).not.toBeChecked();

    await user.click(rowCheckbox);

    await waitFor(() => {
      expect(nativeClick).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        ["1"],
        [data[0]],
        expect.objectContaining({ type: "all" }),
      );
    });

    await waitFor(() => {
      expect(
        within(container).getByRole("checkbox", {
          name: "Select row",
        }),
      ).toBeChecked();
    });
  });

  test("supports controlled rowSelection with string keys", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const { container } = render(
      <ControlledStringSelectionHarness onChange={handleChange} />,
    );

    const rowCheckbox = within(container).getByRole("checkbox", {
      name: "Select row",
    });

    expect(rowCheckbox).toBeChecked();

    await user.click(rowCheckbox);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith([]);
    });

    await waitFor(() => {
      expect(
        within(container).getByRole("checkbox", {
          name: "Select row",
        }),
      ).not.toBeChecked();
    });
  });

  test("supports controlled rowSelection with numeric rowKey values", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const { container } = render(
      <ControlledNumericSelectionHarness onChange={handleChange} />,
    );

    const rowCheckbox = within(container).getByRole("checkbox", {
      name: "Select row",
    });

    expect(rowCheckbox).toBeChecked();

    await user.click(rowCheckbox);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith([]);
    });

    await waitFor(() => {
      expect(
        within(container).getByRole("checkbox", {
          name: "Select row",
        }),
      ).not.toBeChecked();
    });
  });

  test("preserves numeric rowKey types in rowSelection onChange", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const { container } = render(
      <ControlledNumericSelectionHarness
        initialSelectedRowKeys={[]}
        onChange={handleChange}
      />,
    );

    await user.click(
      within(container).getByRole("checkbox", {
        name: "Select row",
      }),
    );

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith([1]);
    });
  });
});

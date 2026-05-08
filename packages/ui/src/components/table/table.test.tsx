import React from "react";

import "@testing-library/jest-dom/vitest";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import type { ColumnsType } from "./types";
import * as localeModule from "../locale";
import * as tableModule from "./index";
import { Table } from "./index";

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
const tableTypesPath = path.resolve(import.meta.dirname, "./types.ts");
const legacySelectionHookPath = path.resolve(
  import.meta.dirname,
  "./hooks/use-selection.tsx",
);

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

  test("table docs include the AntD-like border title and footer example", () => {
    const tableDocs = readFileSync(tableDocsPath, "utf8");

    expect(tableDocs).toContain('from "./examples/border-title-footer"');
    expect(tableDocs).toContain("### Border, Title and Footer");
    expect(tableDocs).toContain("Add border, title and footer for table.");
    expect(tableDocs).toContain('src="table/examples/border-title-footer.tsx"');
    expect(tableDocs).not.toContain('src="table/examples/bordered.tsx"');
    expect(
      existsSync(path.join(tableExamplesDir, "border-title-footer.tsx")),
    ).toBe(true);
    expect(existsSync(path.join(tableExamplesDir, "bordered.tsx"))).toBe(false);
  });

  test("table docs include the summary example", () => {
    const tableDocs = readFileSync(tableDocsPath, "utf8");

    expect(tableDocs).toContain('from "./examples/summary"');
    expect(tableDocs).toContain("### Summary");
    expect(tableDocs).toContain("Set summary content by `summary` prop.");
    expect(tableDocs).toContain('src="table/examples/summary.tsx"');
    expect(existsSync(path.join(tableExamplesDir, "summary.tsx"))).toBe(true);
  });

  test("re-exports locale hook", () => {
    expect(localeModule).toHaveProperty("useLocale");
  });

  test("table source uses the public skeleton component import", () => {
    const tableSource = readFileSync(tableSourcePath, "utf8");

    expect(tableSource).toContain('from "../skeleton"');
    expect(tableSource).not.toContain('from "../../shadcn/skeleton"');
  });

  test("table source owns selection without the legacy useSelection hook", () => {
    const tableSource = readFileSync(tableSourcePath, "utf8");
    const tableTypes = readFileSync(tableTypesPath, "utf8");

    expect(tableSource).toContain('from "../checkbox"');
    expect(tableSource).toContain("<Checkbox");
    expect(tableSource).not.toContain("./hooks/use-selection");
    expect(tableTypes).not.toContain("./hooks/use-selection");
    expect(existsSync(legacySelectionHookPath)).toBe(false);
  });

  test("opts OwnTable out of React Compiler memoization", () => {
    const tableSource = readFileSync(tableSourcePath, "utf8");

    expect(tableSource).toMatch(
      /function OwnTable<TRecord extends AnyObject>\(props: TableProps<TRecord>\) \{\n\s+"use no memo";/,
    );
  });

  test("applies classNames.root to the table container", () => {
    const { container } = render(
      <Table columns={columns} dataSource={data} classNames={{ root: "root-class" }} />,
    );

    expect(container.querySelector('[data-slot="table-container"]')).toHaveClass(
      "root-class",
    );
  });

  test("applies classNames.title to the table title slot", () => {
    const { container } = render(
      <Table
        columns={columns}
        dataSource={data}
        title={() => "Table title"}
        classNames={{ title: "title-class" }}
      />,
    );

    const title = container.querySelector('[data-slot="table-title"]');

    expect(title).toHaveTextContent("Table title");
    expect(title).toHaveClass("title-class");
  });

  test("uses distinct data slots for summary and prop footer", () => {
    const { container } = render(
      <Table
        columns={columns}
        dataSource={data}
        summary={() => (
          <tr>
            <td>Summary content</td>
          </tr>
        )}
        footer={() => "Footer content"}
      />,
    );

    expect(container.querySelector("tfoot")).toHaveAttribute(
      "data-slot",
      "table-summary",
    );
    expect(container.querySelector('[data-slot="table-footer"]')).toHaveTextContent(
      "Footer content",
    );
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

  test("keeps pagination flush with the table without an extra bottom border gap", () => {
    const { container } = render(
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ total: 20, pageSize: 10 }}
      />,
    );

    const pagination = container.querySelector("[data-slot='pagination']");

    expect(pagination).not.toBeNull();
    expect(pagination).toHaveClass("mt-3", "justify-end");
    expect(pagination).not.toHaveClass("my-4", "border-t");
  });

  test("uses the bordered table frame as the only bottom border", () => {
    const { container } = render(
      <Table columns={columns} dataSource={data} bordered />,
    );

    const table = container.querySelector("table");
    const tableContainer = container.querySelector('[data-slot="table-container"]');

    expect(table).toHaveClass("border");
    expect(table).not.toHaveClass("border-b-0");
    expect(tableContainer).toHaveClass(
      "[&_tbody_tr:last-child>td]:border-b-0",
    );
  });

  test("keeps the body-to-summary border in bordered tables", () => {
    const { container } = render(
      <Table
        columns={columns}
        dataSource={data}
        bordered
        summary={() => (
          <tr>
            <td>Summary content</td>
          </tr>
        )}
      />,
    );

    const tableContainer = container.querySelector('[data-slot="table-container"]');

    expect(container.querySelector("tfoot")).toHaveAttribute(
      "data-slot",
      "table-summary",
    );
    expect(tableContainer).not.toHaveClass(
      "[&_tbody_tr:last-child>td]:border-b-0",
    );
    expect(tableContainer).toHaveClass(
      "[&_tfoot_tr:last-child>td]:border-b-0",
    );
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

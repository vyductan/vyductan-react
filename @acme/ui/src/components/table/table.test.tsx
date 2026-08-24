import React from "react";

import "@testing-library/jest-dom/vitest";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import type { SizeType } from "../config-provider/size-context";
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

const numericFilterData: NumericSelectionHarnessRecord[] = [
  {
    id: 1,
    name: "John Brown",
  },
  {
    id: 2,
    name: "Jim Green",
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

function FilteredNumericSelectionHarness({
  onChange,
}: {
  onChange?: (nextSelectedRowKeys: number[]) => void;
}) {
  // Row id=2 is selected but filtered OUT of the visible dataSource — mimics a
  // search/area filter hiding an already-selected row. Only row id=1 renders.
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<number[]>([2]);

  return (
    <Table<NumericSelectionHarnessRecord, number>
      rowKey="id"
      columns={[
        {
          key: "name",
          dataIndex: "name",
          title: "Name",
        },
      ]}
      dataSource={numericFilterData.filter((record) => record.id === 1)}
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

    // Tolerant of the generic signature spanning multiple lines (TRecord +
    // optional TKey); only asserts OwnTable opts out of memoization.
    expect(tableSource).toMatch(
      /function OwnTable<[\s\S]*?>\([\s\S]*?\) \{\s*\n\s+"use no memo";/,
    );
  });

  test("applies classNames.root to the table container", () => {
    const { container } = render(
      <Table
        columns={columns}
        dataSource={data}
        classNames={{ root: "root-class" }}
      />,
    );

    expect(
      container.querySelector('[data-slot="table-container"]'),
    ).toHaveClass("root-class");
  });

  test("applies classNames.title to the table title wrapper", () => {
    const { container } = render(
      <Table
        columns={columns}
        dataSource={data}
        title={() => "Table title"}
        extra="Extra content"
        classNames={{ title: "title-class" }}
      />,
    );

    const titleHeader = container.querySelector('[data-slot="table-title"]');
    const titleContent = container.querySelector(
      '[data-slot="table-title-content"]',
    );
    const titleExtra = container.querySelector(
      '[data-slot="table-title-extra"]',
    );

    expect(titleHeader).toHaveClass("title-class");
    expect(titleContent).toHaveTextContent("Table title");
    expect(titleContent).not.toHaveClass("title-class");
    expect(titleExtra).toHaveTextContent("Extra content");
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
    expect(
      container.querySelector('[data-slot="table-footer"]'),
    ).toHaveTextContent("Footer content");
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
    const tableContainer = container.querySelector(
      '[data-slot="table-container"]',
    );

    expect(table).toHaveClass("border");
    expect(table).not.toHaveClass("border-b-0");
    expect(tableContainer).toHaveClass("[&_tbody_tr:last-child>td]:border-b-0");
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

    const tableContainer = container.querySelector(
      '[data-slot="table-container"]',
    );

    expect(container.querySelector("tfoot")).toHaveAttribute(
      "data-slot",
      "table-summary",
    );
    expect(tableContainer).not.toHaveClass(
      "[&_tbody_tr:last-child>td]:border-b-0",
    );
    expect(tableContainer).toHaveClass("[&_tfoot_tr:last-child>td]:border-b-0");
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

  test("keeps off-view selected keys numeric when a filtered row is toggled", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const { container } = render(
      <FilteredNumericSelectionHarness onChange={handleChange} />,
    );

    // Only the visible row (id=1) has a checkbox; id=2 is selected-but-hidden.
    await user.click(
      within(container).getByRole("checkbox", { name: "Select row" }),
    );

    await waitFor(() => {
      // id=2 carries over from the controlled keys; pre-fix it leaked back as
      // the string "2" because the Table only mapped currently-visible rows.
      expect(handleChange).toHaveBeenCalledWith([2, 1]);
    });

    const reported = handleChange.mock.calls.at(-1)?.[0] as unknown[];
    expect(reported.every((key) => typeof key === "number")).toBe(true);
  });
});

describe("Table right-aligned sorter gutter", () => {
  type FeeRecord = { id: number; fee: number };

  const feeRows: FeeRecord[] = [{ id: 1, fee: 1000 }];

  function renderFeeTable(options: {
    align?: "left" | "right";
    sorter?: boolean;
    size?: SizeType;
  }) {
    const columns: ColumnsType<FeeRecord> = [
      {
        title: "Fee",
        key: "fee",
        align: options.align,
        sorter: options.sorter,
        render: (_, record) => <span>{record.fee}</span>,
      },
    ];

    return render(
      <Table<FeeRecord>
        columns={columns}
        dataSource={feeRows}
        rowKey="id"
        size={options.size}
      />,
    );
  }

  function bodyCell(container: HTMLElement) {
    const cell = container.querySelector("tbody td");
    if (!(cell instanceof HTMLElement)) {
      throw new Error("body cell was not rendered");
    }
    return cell;
  }

  /**
   * The sorter icon trails the header label, so it consumes ~26px at the cell's
   * right edge and leaves the label inset from it. The body cells take a matching
   * right gutter so the values land under the LABEL rather than under the icon.
   */
  test("gutters body cells of a right-aligned sortable column", () => {
    const { container } = renderFeeTable({ align: "right", sorter: true });

    // Default size: the cell's own p-3 (12px) plus the icon's 16px + 4px.
    expect(bodyCell(container).className).toContain("pr-[32px]");
  });

  // `pr-*` REPLACES the base padding, so a single hardcoded gutter would
  // misalign every tier but one. Each tier's gutter is its own padding + the
  // icon's 16px + its 4px margin.
  test.each([
    ["small", "pr-[28px]"], // p-2 = 8 + 20
    ["middle", "pr-[32px]"], // p-3 = 12 + 20
    ["large", "pr-[36px]"], // p-4 = 16 + 20
  ] as const)(
    "uses the %s size's own padding as the gutter base",
    (size, expected) => {
      const { container } = renderFeeTable({
        align: "right",
        sorter: true,
        size,
      });

      expect(bodyCell(container).className).toContain(expected);
    },
  );

  test("leaves a right-aligned column without a sorter unpadded", () => {
    const { container } = renderFeeTable({ align: "right" });

    // No icon in the header means nothing to compensate for — padding here
    // would push these values out of line with their own heading.
    expect(bodyCell(container).className).not.toMatch(/pr-\[(28|32|36)px\]/);
  });

  test("leaves a sortable left-aligned column unpadded", () => {
    const { container } = renderFeeTable({ align: "left", sorter: true });

    expect(bodyCell(container).className).not.toMatch(/pr-\[(28|32|36)px\]/);
  });
});

describe("Table size tiers", () => {
  type Row = { id: number; name: string };

  const rows: Row[] = [{ id: 1, name: "John Brown" }];

  function renderSized(size?: SizeType) {
    const columns: ColumnsType<Row> = [
      { title: "Name", dataIndex: "name", key: "name", sorter: true },
    ];

    return render(
      <Table<Row>
        columns={columns}
        dataSource={rows}
        rowKey="id"
        size={size}
        title={() => "Header"}
        footer={() => "Footer"}
      />,
    );
  }

  function requireElement(container: HTMLElement, selector: string) {
    const found = container.querySelector(selector);
    if (!(found instanceof HTMLElement)) {
      throw new Error(`${selector} was not rendered`);
    }
    return found;
  }

  /**
   * The whole point of the tier map: three sizes must produce three DIFFERENT
   * paddings. Before it existed every site branched on `size === "small"`
   * alone, so `middle` and `large` rendered identically and the prop's third
   * option was a lie.
   */
  test.each([
    ["small", "p-2"],
    ["middle", "p-3"],
    ["large", "p-4"],
  ] as const)("pads %s cells with %s", (size, expected) => {
    const { container } = renderSized(size);

    expect(requireElement(container, "tbody td").className).toContain(expected);
    expect(requireElement(container, "thead th").className).toContain(expected);
  });

  test("treats an unset size as the middle tier", () => {
    const { container } = renderSized();

    expect(requireElement(container, "tbody td").className).toContain("p-3");
  });

  test("gives the title and footer the same tier as the cells", () => {
    const { container } = renderSized("large");

    expect(
      requireElement(container, '[data-slot="table-footer"]').className,
    ).toContain("p-4");
  });

  /**
   * The sorter's hover box widens the hit area by its padding and pulls the
   * same amount back with a negative margin, so a sortable header stays as
   * tall as a plain one. A fixed `-my-2` against a per-tier padding is what
   * made small headers 4px short.
   */
  test.each([
    ["small", "-my-1", "p-1"],
    ["middle", "-my-2", "p-2"],
    ["large", "-my-3", "p-3"],
  ] as const)(
    "matches the %s sorter box's negative margin to its padding",
    (size, margin, padding) => {
      const { container } = renderSized(size);
      const box = requireElement(container, "thead th div[class*='-my-']");

      expect(box.className).toContain(margin);
      expect(box.className).toContain(padding);
    },
  );

  /**
   * Ant Design's lineHeight does not vary by size, and shadcn's `<table>`
   * carries `text-sm` (20px). The 22px override therefore belongs to every
   * tier, not only to `small` where it originally lived.
   */
  test.each(["small", "middle", "large"] as const)(
    "keeps the 22px line height at %s",
    (size) => {
      const { container } = renderSized(size);

      expect(requireElement(container, "tbody td").className).toContain(
        "leading-[22px]",
      );
    },
  );
});

describe("Table bordered corner cells", () => {
  type Row = { id: number; name: string; total: string };

  const rows: Row[] = [{ id: 1, name: "John Brown", total: "1.00" }];
  const columns: ColumnsType<Row> = [
    { title: "Name", dataIndex: "name", key: "name", fixed: "left" },
    { title: "Total", dataIndex: "total", key: "total", align: "right" },
  ];

  const TL =
    "[&_thead_tr:first-child>th:first-child]:rounded-tl-[calc(var(--radius)_-_3px)]";
  const TR =
    "[&_thead_tr:first-child>th:last-child]:rounded-tr-[calc(var(--radius)_-_3px)]";
  const BL =
    "[&_tbody_tr:last-child>td:first-child]:rounded-bl-[calc(var(--radius)_-_3px)]";
  const BR =
    "[&_tbody_tr:last-child>td:last-child]:rounded-br-[calc(var(--radius)_-_3px)]";
  const BODY_TL =
    "[&_tbody_tr:first-child>td:first-child]:rounded-tl-[calc(var(--radius)_-_3px)]";
  const FOOT_BL =
    "[&_tfoot_tr:last-child>td:first-child]:rounded-bl-[calc(var(--radius)_-_3px)]";

  function renderTable(props: Record<string, unknown> = {}) {
    const { container } = render(
      <Table<Row> columns={columns} dataSource={rows} rowKey="id" {...props} />,
    );
    const tableContainer = container.querySelector(
      '[data-slot="table-container"]',
    );
    if (!(tableContainer instanceof HTMLElement)) {
      throw new Error("table container was not rendered");
    }
    return tableContainer;
  }

  /**
   * A pinned cell is opaque, and every cell is a positioned descendant of the
   * `<table>` that carries the outer border — so without a matching radius the
   * corner cell's square background covers the rounded corner.
   */
  test.each([["around"], [true]] as const)(
    "rounds the four corner cells when bordered=%s",
    (bordered) => {
      const tableContainer = renderTable({ bordered });

      expect(tableContainer).toHaveClass(TL);
      expect(tableContainer).toHaveClass(TR);
      expect(tableContainer).toHaveClass(BL);
      expect(tableContainer).toHaveClass(BR);
    },
  );

  test("leaves the corners alone when the table is not bordered", () => {
    const tableContainer = renderTable();

    // No outer radius to protect, so nothing to round.
    expect(tableContainer).not.toHaveClass(TL);
    expect(tableContainer).not.toHaveClass(BL);
  });

  test("squares the top corners when a title takes that edge", () => {
    // The table itself gets `rounded-t-none`, so rounding the head cells there
    // would carve a notch out of a straight edge.
    const tableContainer = renderTable({ bordered: true, title: () => "H" });

    expect(tableContainer).not.toHaveClass(TL);
    expect(tableContainer).not.toHaveClass(TR);
    expect(tableContainer).toHaveClass(BL);
  });

  test("squares the bottom corners when a footer takes that edge", () => {
    const tableContainer = renderTable({ bordered: true, footer: () => "F" });

    expect(tableContainer).not.toHaveClass(BL);
    expect(tableContainer).not.toHaveClass(BR);
    expect(tableContainer).toHaveClass(TL);
  });

  test("moves the bottom corners onto the summary row", () => {
    // Same "which row is painted last" question the border-b-0 rule answers.
    const tableContainer = renderTable({
      bordered: true,
      summary: () => (
        <tr>
          <td>Total</td>
        </tr>
      ),
    });

    expect(tableContainer).toHaveClass(FOOT_BL);
    expect(tableContainer).not.toHaveClass(BL);
  });

  test("moves the top corners onto the first body row when the header is hidden", () => {
    const tableContainer = renderTable({ bordered: true, showHeader: false });

    expect(tableContainer).toHaveClass(BODY_TL);
    expect(tableContainer).not.toHaveClass(TL);
  });
});

describe("Table sticky header scrollport", () => {
  type Row = { id: number; name: string };

  const rows: Row[] = [{ id: 1, name: "John Brown" }];
  const columns: ColumnsType<Row> = [
    { title: "Name", dataIndex: "name", key: "name" },
  ];

  /**
   * shadcn's `<Table>` wraps the `<table>` in its own `overflow-x-auto` div,
   * and `overflow-x: auto` drags `overflow-y` to `auto` — making that div the
   * header's nearest scrollport, with no scroll range of its own, so a
   * `position: sticky` header scrolls away instead of sticking. It takes no
   * className, so `TableRoot` neutralises it from the parent.
   */
  const NEUTRALISE = "[&>[data-slot=table-container]]:overflow-visible";

  function renderRoot(props: Record<string, unknown> = {}) {
    const { container } = render(
      <Table<Row> columns={columns} dataSource={rows} rowKey="id" {...props} />,
    );
    const root = container.querySelector('[data-slot="table-root"]');
    if (!(root instanceof HTMLElement)) {
      throw new Error("table root was not rendered");
    }
    return root;
  }

  test.each([
    ["sticky", { sticky: true }],
    ["scroll.y", { scroll: { y: 200 } }],
    ["both", { sticky: true, scroll: { y: 200 } }],
  ] as const)("frees the header's scrollport for %s", (_label, props) => {
    expect(renderRoot(props)).toHaveClass(NEUTRALISE);
  });

  test("leaves the wrapper alone without a sticky header", () => {
    // That wrapper is the only thing keeping an over-wide table scrollable
    // instead of spilling out of its container, so it stays for plain tables.
    expect(renderRoot()).not.toHaveClass(NEUTRALISE);
    expect(renderRoot({ scroll: { x: 1200 } })).not.toHaveClass(NEUTRALISE);
  });

  test("tracks the same condition the header uses to go sticky", () => {
    const source = readFileSync(
      path.resolve(import.meta.dirname, "./table.tsx"),
      "utf8",
    );

    // If these drift, a table can render a sticky header while the wrapper
    // that blocks it is left in place — the original bug.
    expect(source).toContain("stickyHeader={Boolean(sticky || scroll?.y)}");
    expect(source).toContain(
      'position: sticky || scroll?.y ? "sticky" : undefined',
    );
  });
});

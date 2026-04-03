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

const tableExamplesDir = path.resolve(import.meta.dirname, "./examples");
const tableDocsPath = path.resolve(import.meta.dirname, "./table.mdx");

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

    expect(dragSortingFullRow).toContain(
      'from "@acme/ui/components/table"',
    );
    expect(dragSortingWithHandle).toContain(
      'from "@acme/ui/components/table"',
    );
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

  test("uses a single table scroll container for own table mode", () => {
    render(
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

    expect(screen.getByText("John Brown")).not.toBeNull();
    expect(
      document.querySelectorAll('[data-slot="table-container"]'),
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
});

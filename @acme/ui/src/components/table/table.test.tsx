import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import useSelection from "./hooks/use-selection";
import { Table } from "./index";
import { tableLocale_en } from "./locale/en-us";
import type { ColumnsType } from "./types";

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

function SelectionDropdownHarness({
  getPopupContainer,
  onSelect,
}: {
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  onSelect: () => void;
}) {
  const [, , transformColumns] = useSelection<SelectionHarnessRecord>(
    {
      childrenColumnName: "children",
      data,
      expandType: null,
      getPopupContainer,
      getRecordByKey: (key) => data.find((record) => record.key === key)!,
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
  );

  const transformedColumns = transformColumns(columns);
  const title = transformedColumns[0]?.title;

  return typeof title === "function" ? <>{title({ table: {} as never })}</> : <>{title}</>;
}

describe("Table", () => {
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

    expect(screen.getByText("John Brown")).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="table-container"]')).toHaveLength(1);
  });

  test("selection actions still fire when menu is portaled outside the trigger root", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const popupContainer = document.createElement("div");
    popupContainer.setAttribute("data-testid", "popup-root");
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

    await user.click(trigger!);
    await user.click(await screen.findByRole("menuitem", { name: "Run action" }));

    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalledTimes(1);
    });
  });
});

import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

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
});
